import request from 'supertest';
import app from '../index';
import prisma from '../prisma';
import { RoutingService } from '../services/routingService';

describe('DoubtBridge Integration Tests', () => {
  let studentId: string;
  let studentToken: string;
  let faculty1Id: string;
  let faculty2Id: string;
  let departmentId: string;
  let subjectId: string;
  let topicId: string;

  beforeAll(async () => {
    // Clean DB
    await prisma.activityLog.deleteMany();
    await prisma.doubtResponse.deleteMany();
    await prisma.doubtAssignment.deleteMany();
    await prisma.doubt.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.facultyTopicExpertise.deleteMany();
    await prisma.facultyExpertise.deleteMany();
    await prisma.facultyProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();

    // 1. Setup Academic Data
    const dept = await prisma.department.create({ data: { name: 'Computer Science' } });
    departmentId = dept.id;

    const subj = await prisma.subject.create({ data: { name: 'Algorithms', departmentId } });
    subjectId = subj.id;

    const topic = await prisma.topic.create({ data: { name: 'Dynamic Programming', subjectId } });
    topicId = topic.id;

    // 2. Setup Student
    const studentRes = await request(app).post('/auth/register').send({
      email: 'student@test.com',
      password: 'password123',
      name: 'Test Student',
      departmentId
    });
    studentId = studentRes.body.data.id;

    const loginRes = await request(app).post('/auth/login').send({
      email: 'student@test.com',
      password: 'password123'
    });
    studentToken = loginRes.body.data.token;

    // 3. Setup Faculty 1 (Expert in Subject but NOT Topic)
    const f1 = await prisma.user.create({
      data: {
        email: 'faculty1@test.com', password: 'hash', name: 'Faculty 1', role: 'FACULTY',
        facultyProfile: {
          create: {
            departmentId, maxWorkload: 2, availableFrom: new Date(Date.now() - 10000), availableUntil: new Date(Date.now() + 86400000)
          }
        }
      },
      include: { facultyProfile: true }
    });
    faculty1Id = f1.facultyProfile!.id;
    await prisma.facultyExpertise.create({ data: { facultyProfileId: faculty1Id, subjectId } });

    // 4. Setup Faculty 2 (Expert in Subject AND Topic)
    const f2 = await prisma.user.create({
      data: {
        email: 'faculty2@test.com', password: 'hash', name: 'Faculty 2', role: 'FACULTY',
        facultyProfile: {
          create: {
            departmentId, maxWorkload: 2, availableFrom: new Date(Date.now() - 10000), availableUntil: new Date(Date.now() + 86400000)
          }
        }
      },
      include: { facultyProfile: true }
    });
    faculty2Id = f2.facultyProfile!.id;
    await prisma.facultyExpertise.create({ data: { facultyProfileId: faculty2Id, subjectId } });
    await prisma.facultyTopicExpertise.create({ data: { facultyProfileId: faculty2Id, topicId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should authenticate user and return JWT', async () => {
    expect(studentToken).toBeDefined();
  });

  it('should route doubt to Faculty 2 because of Topic expertise', async () => {
    const res = await request(app).post('/doubts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Help with DP',
        description: 'I do not understand memoization',
        departmentId,
        subjectId,
        topicId
      });

    expect(res.status).toBe(201);
    const doubtId = res.body.data.id;

    // Wait for async routing
    await new Promise(r => setTimeout(r, 500));

    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId }, include: { assignments: true } });
    expect(doubt?.status).toBe('ASSIGNED');
    expect(doubt?.assignments[0].facultyId).toBe(faculty2Id); // Faculty 2 has topic expertise
  });

  it('should route to Faculty 1 when Faculty 2 is at max workload', async () => {
    // Fill Faculty 2's workload (max is 2, currently 1)
    const d2 = await prisma.doubt.create({
      data: { title: 'Dummy 1', description: 'desc', studentId: (await prisma.studentProfile.findFirst())!.id, departmentId, subjectId, status: 'ASSIGNED' }
    });
    await prisma.doubtAssignment.create({ data: { doubtId: d2.id, facultyId: faculty2Id, routingScore: 100 } });

    // Now submit another doubt with Topic
    const res = await request(app).post('/doubts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Another DP question',
        description: 'Need more help',
        departmentId,
        subjectId,
        topicId
      });
      
    await new Promise(r => setTimeout(r, 500));
    
    if (res.status !== 201) {
      console.log('Test 2 Error:', res.body);
    }
    const doubtId = res.body.data.id;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId }, include: { assignments: true } });
    expect(doubt?.status).toBe('ASSIGNED');
    expect(doubt?.assignments[0].facultyId).toBe(faculty1Id); // Faculty 2 is full, so falls back to Faculty 1
  });

  it('should queue doubt if no faculty is available', async () => {
    // Fill Faculty 1's workload too (max is 2, currently 1)
    const d3 = await prisma.doubt.create({
      data: { title: 'Dummy 2', description: 'desc', studentId: (await prisma.studentProfile.findFirst())!.id, departmentId, subjectId, status: 'ASSIGNED' }
    });
    await prisma.doubtAssignment.create({ data: { doubtId: d3.id, facultyId: faculty1Id, routingScore: 100 } });

    // Submit doubt
    const res = await request(app).post('/doubts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'No one is free',
        description: 'Please help',
        departmentId,
        subjectId
      });
      
    await new Promise(r => setTimeout(r, 500));
    
    if (res.status !== 201) {
      console.log('Test 3 Error:', res.body);
    }
    const doubtId = res.body.data.id;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('QUEUED');
  });
});
