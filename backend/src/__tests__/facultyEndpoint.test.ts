import request from 'supertest';
import app from '../index'; // Assuming this exports the express app
import prisma from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RoutingService } from '../services/routingService';

import { cleanupDatabase } from './helpers/cleanupDatabase';

describe('GET /faculty/doubts', () => {
  let studentToken: string;
  let adminToken: string;
  let faculty1Token: string;
  let faculty2Token: string;
  
  let studentUserId: string;
  let adminUserId: string;
  let faculty1UserId: string;
  let faculty2UserId: string;
  
  let faculty1ProfileId: string;
  let faculty2ProfileId: string;
  let studentProfileId: string;

  beforeAll(async () => {
    await cleanupDatabase();

    // Setup base entities
    const dept = await prisma.department.create({ data: { name: 'Comp Sci' } });
    const sub = await prisma.subject.create({ data: { name: '101', departmentId: dept.id } });

    // Setup Users
    const pwd = await bcrypt.hash('password123', 10);
    const s = await prisma.user.create({ data: { email: 's@u.com', password: pwd, name: 'S', role: 'STUDENT' } });
    const f1 = await prisma.user.create({ data: { email: 'f1@u.com', password: pwd, name: 'F1', role: 'FACULTY' } });
    const f2 = await prisma.user.create({ data: { email: 'f2@u.com', password: pwd, name: 'F2', role: 'FACULTY' } });
    const a = await prisma.user.create({ data: { email: 'a@u.com', password: pwd, name: 'A', role: 'ADMIN' } });

    studentUserId = s.id;
    faculty1UserId = f1.id;
    faculty2UserId = f2.id;
    adminUserId = a.id;

    // Profiles
    const sp = await prisma.studentProfile.create({ data: { userId: s.id, departmentId: dept.id } });
    const fp1 = await prisma.facultyProfile.create({ data: { userId: f1.id, departmentId: dept.id, maxWorkload: 5 } });
    const fp2 = await prisma.facultyProfile.create({ data: { userId: f2.id, departmentId: dept.id, maxWorkload: 5 } });
    studentProfileId = sp.id;
    faculty1ProfileId = fp1.id;
    faculty2ProfileId = fp2.id;

    // Tokens
    studentToken = jwt.sign({ id: s.id, email: s.email, role: s.role }, process.env.JWT_SECRET || 'secret');
    faculty1Token = jwt.sign({ id: f1.id, email: f1.email, role: f1.role }, process.env.JWT_SECRET || 'secret');
    faculty2Token = jwt.sign({ id: f2.id, email: f2.email, role: f2.role }, process.env.JWT_SECRET || 'secret');
    adminToken = jwt.sign({ id: a.id, email: a.email, role: a.role }, process.env.JWT_SECRET || 'secret');

    // Create a doubt assigned to F1
    const d1 = await prisma.doubt.create({
      data: {
        title: 'Doubt for F1',
        description: 'Testing',
        status: 'ASSIGNED',
        departmentId: dept.id,
        subjectId: sub.id,
        studentId: studentProfileId
      }
    });
    await prisma.doubtAssignment.create({ data: { doubtId: d1.id, facultyId: faculty1ProfileId, routingScore: 80 } });

    // Create a doubt assigned to F2
    const d2 = await prisma.doubt.create({
      data: {
        title: 'Doubt for F2',
        description: 'Testing',
        status: 'ASSIGNED',
        departmentId: dept.id,
        subjectId: sub.id,
        studentId: studentProfileId
      }
    });
    await prisma.doubtAssignment.create({ data: { doubtId: d2.id, facultyId: faculty2ProfileId, routingScore: 80 } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should deny unauthenticated requests', async () => {
    const res = await request(app).get('/faculty/doubts');
    expect(res.status).toBe(401);
  });

  it('should deny student access', async () => {
    const res = await request(app)
      .get('/faculty/doubts')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('should deny admin access', async () => {
    const res = await request(app)
      .get('/faculty/doubts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
  });

  it('should return only doubts assigned to the authenticated faculty member (F1)', async () => {
    const res = await request(app)
      .get('/faculty/doubts')
      .set('Authorization', `Bearer ${faculty1Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Doubt for F1');
  });

  it('should return only doubts assigned to the authenticated faculty member (F2)', async () => {
    const res = await request(app)
      .get('/faculty/doubts')
      .set('Authorization', `Bearer ${faculty2Token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Doubt for F2');
  });
});
