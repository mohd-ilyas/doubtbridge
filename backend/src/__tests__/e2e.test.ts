import request from 'supertest';
import app from '../index';
import prisma from '../prisma';
import { cleanupDatabase } from './helpers/cleanupDatabase';

describe('Phase 6 End-to-End Verification', () => {
  let studentToken: string;
  let facultyToken: string;
  let adminToken: string;
  let studentId: string;
  let facultyId: string;
  let adminId: string;
  let deptId: string;
  let subjId: string;
  let doubtId: string;

  beforeAll(async () => {
    await cleanupDatabase();
    // Generate unique suffix for emails
    const suffix = Date.now();
    const adminEmail = `admin_${suffix}@test.com`;
    const facultyEmail = `faculty_${suffix}@test.com`;
    const studentEmail = `student_${suffix}@test.com`;

    // Setup base data
    const dept = await prisma.department.create({ data: { name: `Engineering_${suffix}` } });
    const sub = await prisma.subject.create({ data: { name: `Computer Science_${suffix}`, departmentId: dept.id } });
    deptId = dept.id;
    subjId = sub.id;

    // Create Admin directly in DB
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const pwd = await bcrypt.hash('password', 10);
    const admin = await prisma.user.create({
      data: { email: adminEmail, password: pwd, name: 'Admin', role: 'ADMIN' }
    });
    adminId = admin.id;
    adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, process.env.JWT_SECRET || 'secret');

    // Create Student
    const studentRes = await request(app).post('/auth/register').send({ email: studentEmail, password: 'password123', name: 'Student', departmentId: deptId });
    if (studentRes.status !== 201) {
      throw new Error(`Student Creation Failed: ${JSON.stringify(studentRes.body)}`);
    }
    studentId = studentRes.body.data.id;
    
    // Login Student
    const sLogin = await request(app).post('/auth/login').send({ email: studentEmail, password: 'password123' });
    studentToken = sLogin.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Student submits a doubt (No eligible faculty) -> QUEUED', async () => {
    const res = await request(app).post('/doubts').set('Authorization', `Bearer ${studentToken}`).send({
      title: 'Doubt Title',
      description: 'Doubt desc',
      subjectId: subjId,
      departmentId: deptId
    });
    expect(res.status).toBe(201);
    doubtId = res.body.data.id;
    
    // Wait for async routing
    await new Promise(r => setTimeout(r, 500));
    
    // Fetch doubt from db directly or via student route to verify it is QUEUED
    const getRes = await request(app).get(`/doubts/student`).set('Authorization', `Bearer ${studentToken}`);
    const d = getRes.body.data.find((d: any) => d.id === doubtId);
    expect(d.status).toBe('QUEUED');
  });

  it('1.5. Create eligible faculty and trigger retry -> ASSIGNED', async () => {
    // Admin creates Faculty
    const facultyRes = await request(app)
      .post('/admin/faculty')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: `faculty_${Date.now()}@test.com`, password: 'password123', name: 'Dr. Smith', departmentId: deptId, maxWorkload: 5 });
    
    expect(facultyRes.status).toBe(201);
    facultyId = facultyRes.body.data.id;
    const facultyProfileId = facultyRes.body.data.facultyProfile.id;

    // Add expertise and availability directly in DB for testing routing
    await prisma.facultyExpertise.create({
      data: { facultyProfileId, subjectId: subjId }
    });
    const now = new Date();
    await prisma.facultyProfile.update({
      where: { id: facultyProfileId },
      data: {
        availableFrom: new Date(now.getTime() - 1000 * 60 * 60), // 1 hr ago
        availableUntil: new Date(now.getTime() + 1000 * 60 * 60 * 8) // 8 hrs from now
      }
    });

    const fLogin = await request(app).post('/auth/login').send({ email: facultyRes.body.data.email, password: 'password123' });
    facultyToken = fLogin.body.data.token;

    // Trigger retry explicitly
    const { RoutingService } = require('../services/routingService');
    await RoutingService.retryQueuedDoubts(deptId);
    
    // Wait slightly
    await new Promise(r => setTimeout(r, 500));

    // Verify it is now assigned
    const getRes = await request(app).get(`/doubts/student`).set('Authorization', `Bearer ${studentToken}`);
    const d = getRes.body.data.find((d: any) => d.id === doubtId);
    expect(d.status).toBe('ASSIGNED');
  });

  it('2. Faculty views assigned doubt', async () => {
    // Wait slightly for async routing to complete
    await new Promise(r => setTimeout(r, 500));
    const res = await request(app).get(`/faculty/doubts`).set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(200);
    const doubt = res.body.data.find((d: any) => d.id === doubtId);
    expect(doubt).toBeDefined();
  });

  it('3. Faculty accepts the doubt', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/accept`).set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACCEPTED');
  });

  it('4. Faculty starts working on the doubt', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/start`).set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('5. Faculty responds to the doubt', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/respond`).set('Authorization', `Bearer ${facultyToken}`).send({ content: 'Solution is X' });
    expect(res.status).toBe(201);
    
    const getRes = await request(app).get(`/doubts/student`).set('Authorization', `Bearer ${studentToken}`);
    const d = getRes.body.data.find((d: any) => d.id === doubtId);
    expect(d.status).toBe('ANSWERED');
    expect(d.responses).toHaveLength(1);
    expect(d.responses[0]).toMatchObject({ content: 'Solution is X', user: { name: 'Dr. Smith', role: 'FACULTY' } });
  });

  it('6. Student resolves the doubt', async () => {
    const res = await request(app).post(`/doubts/${doubtId}/resolve`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('7. Student closes the doubt', async () => {
    const res = await request(app).post(`/doubts/${doubtId}/close`).set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CLOSED');
  });

  it('8. Test Edge Case: Invalid state transition', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/accept`).set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(400); // Bad request because doubt is CLOSED
  });
});
