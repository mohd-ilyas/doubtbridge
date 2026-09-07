import request from 'supertest';
import app from '../index';
import prisma from '../prisma';
import { cleanupDatabase } from './helpers/cleanupDatabase';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

describe('Academic API contract', () => {
  let departmentOne: string;
  let departmentTwo: string;
  let subjectOne: string;
  let subjectTwo: string;
  let topicOne: string;
  let topicTwo: string;
  let studentToken: string;

  beforeAll(async () => {
    await cleanupDatabase();
    const first = await prisma.department.create({ data: { name: 'Test Department Alpha' } });
    const second = await prisma.department.create({ data: { name: 'Test Department Beta' } });
    departmentOne = first.id;
    departmentTwo = second.id;
    const firstSubject = await prisma.subject.create({ data: { name: 'Subject One', departmentId: departmentOne } });
    const secondSubject = await prisma.subject.create({ data: { name: 'Subject Two', departmentId: departmentTwo } });
    subjectOne = firstSubject.id;
    subjectTwo = secondSubject.id;
    topicOne = (await prisma.topic.create({ data: { name: 'Topic One', subjectId: subjectOne } })).id;
    topicTwo = (await prisma.topic.create({ data: { name: 'Topic Two', subjectId: subjectTwo } })).id;
    const registration = await request(app).post('/auth/register').send({
      email: 'academic@student.test', password: 'password123', name: 'Academic Student', departmentId: departmentOne,
    });
    studentToken = jwt.sign({ id: registration.body.data.id, role: 'STUDENT' }, env.JWT_SECRET);
  });

  afterAll(async () => prisma.$disconnect());

  it('filters subjects by department and topics by subject', async () => {
    const subjects = await request(app).get(`/api/subjects?departmentId=${departmentOne}`);
    expect(subjects.body.data.map((item: { id: string }) => item.id)).toEqual([subjectOne]);
    const topics = await request(app).get(`/api/topics?subjectId=${subjectOne}`);
    expect(topics.body.data.map((item: { id: string }) => item.id)).toEqual([topicOne]);
  });

  it('rejects a subject from a different department', async () => {
    const response = await request(app).post('/doubts').set('Authorization', `Bearer ${studentToken}`).send({
      title: 'Invalid academic selection', description: 'This must be rejected by the server.', departmentId: departmentOne, subjectId: subjectTwo,
    });
    expect(response.status).toBe(400);
  });

  it('rejects a topic from a different subject', async () => {
    const response = await request(app).post('/doubts').set('Authorization', `Bearer ${studentToken}`).send({
      title: 'Invalid topic selection', description: 'This must be rejected by the server.', departmentId: departmentOne, subjectId: subjectOne, topicId: topicTwo,
    });
    expect(response.status).toBe(400);
  });
});
