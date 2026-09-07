import request from 'supertest';
import app from '../index';
import prisma from '../prisma';

describe('Doubt Lifecycle & Security Tests', () => {
  let student1Id: string, student1Token: string;
  let student2Token: string;
  let facultyToken: string;
  let departmentId: string, subjectId: string;
  let doubtId: string;

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

    // Setup Dept & Subj
    const dept = await prisma.department.findFirst() || await prisma.department.create({ data: { name: 'Math' } });
    departmentId = dept.id;
    const subj = await prisma.subject.findFirst() || await prisma.subject.create({ data: { name: 'Calculus', departmentId } });
    subjectId = subj.id;

    // Student 1
    const s1 = await request(app).post('/auth/register').send({ email: 's1@t.com', password: 'password123', name: 'S1', departmentId });
    student1Id = s1.body.data.id;
    const s1L = await request(app).post('/auth/login').send({ email: 's1@t.com', password: 'password123' });
    student1Token = s1L.body.data.token;

    // Student 2
    await request(app).post('/auth/register').send({ email: 's2@t.com', password: 'password123', name: 'S2', departmentId });
    const s2L = await request(app).post('/auth/login').send({ email: 's2@t.com', password: 'password123' });
    student2Token = s2L.body.data.token;

    // Faculty
    const fRealUser = await request(app).post('/auth/register').send({ email: 'f1_real@t.com', password: 'password123', name: 'F1', departmentId });
    const fRealUserId = fRealUser.body.data.id;
    await prisma.studentProfile.delete({ where: { userId: fRealUserId } });
    await prisma.user.update({ where: { id: fRealUserId }, data: { role: 'FACULTY' } });
    
    const fp = await prisma.facultyProfile.create({ data: { userId: fRealUserId, departmentId, availableFrom: new Date(Date.now() - 10000), availableUntil: new Date(Date.now() + 86400000) } });
    await prisma.facultyExpertise.create({ data: { facultyProfileId: fp.id, subjectId } });
    
    const fL = await request(app).post('/auth/login').send({ email: 'f1_real@t.com', password: 'password123' });
    facultyToken = fL.body.data.token;
  });

  it('DRAFT -> SUBMITTED -> ASSIGNED (auto)', async () => {
    const res = await request(app).post('/doubts').set('Authorization', `Bearer ${student1Token}`)
      .send({ title: 'Unique Lifecycle Doubt', description: 'Long enough desc', departmentId, subjectId });
    expect(res.status).toBe(201);
    doubtId = res.body.data.id;
    await new Promise(r => setTimeout(r, 500));
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('ASSIGNED');
  });

  it('Student Security: S2 cannot access S1 doubt', async () => {
    // Actually we don't have a GET /doubts/:id for student yet, but if they try to resolve it, it should fail.
    const res = await request(app).post(`/doubts/${doubtId}/resolve`).set('Authorization', `Bearer ${student2Token}`);
    expect(res.status).toBe(403);
  });

  it('Faculty Action: ACCEPTED', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/accept`).set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(200);
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('ACCEPTED');
  });

  it('Student Security: Student cannot perform faculty action', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/respond`).set('Authorization', `Bearer ${student1Token}`).send({ content: 'test' });
    expect(res.status).toBe(403); // or 403 based on role middleware
  });

  it('Faculty Action: Start Working (IN_PROGRESS)', async () => {
    // Attempting to respond before IN_PROGRESS should fail
    const failRes = await request(app).post(`/faculty/doubts/${doubtId}/respond`).set('Authorization', `Bearer ${facultyToken}`).send({ content: 'Early answer' });
    expect(failRes.status).toBe(400);

    const res = await request(app).post(`/faculty/doubts/${doubtId}/start`).set('Authorization', `Bearer ${facultyToken}`);
    expect(res.status).toBe(200);
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('IN_PROGRESS');
  });

  it('Faculty Action: Respond (ANSWERED)', async () => {
    const res = await request(app).post(`/faculty/doubts/${doubtId}/respond`).set('Authorization', `Bearer ${facultyToken}`).send({ content: 'Here is your answer' });
    expect(res.status).toBe(201);
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('ANSWERED');
  });

  it('Student Action: Resolve (RESOLVED)', async () => {
    const res = await request(app).post(`/doubts/${doubtId}/resolve`).set('Authorization', `Bearer ${student1Token}`);
    expect(res.status).toBe(200);
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('RESOLVED');
  });

  it('Student Action: Close (CLOSED)', async () => {
    // Attempt to close from another student
    const failRes = await request(app).post(`/doubts/${doubtId}/close`).set('Authorization', `Bearer ${student2Token}`);
    expect(failRes.status).toBe(403);

    const res = await request(app).post(`/doubts/${doubtId}/close`).set('Authorization', `Bearer ${student1Token}`);
    expect(res.status).toBe(200);
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    expect(doubt?.status).toBe('CLOSED');
  });
});
