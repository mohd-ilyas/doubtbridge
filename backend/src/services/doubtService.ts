import prisma from '../prisma';
import { RoutingService } from './routingService';
import { AppError } from '../utils/errors';

export class DoubtService {
  
  static async isDuplicate(studentId: string, subjectId: string, title: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentDoubts = await prisma.doubt.findMany({
      where: {
        studentId,
        subjectId,
        createdAt: { gte: oneHourAgo }
      }
    });

    // Extremely lightweight title similarity check (substring/exact match for MVP)
    const normalizedNewTitle = title.toLowerCase().trim();
    for (const doubt of recentDoubts) {
      const normalizedExisting = doubt.title.toLowerCase().trim();
      if (normalizedExisting === normalizedNewTitle) {
        return true;
      }
    }
    return false;
  }

  static async submitDoubt(data: any, studentProfileId: string, userId: string) {
    // 1. Lightweight Duplicate Detection
    const isDup = await this.isDuplicate(studentProfileId, data.subjectId, data.title);
    if (isDup) {
      throw new AppError('A similar doubt was recently submitted.', 409); // Conflict
    }

    // 2. Validate the complete academic hierarchy server-side.
    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) throw new AppError('Department not found', 404);

    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) throw new AppError('Subject not found', 404);
    
    if (data.departmentId !== subject.departmentId) {
      throw new AppError('Department ID does not match the subject department', 400);
    }

    if (data.topicId) {
      const topic = await prisma.topic.findUnique({ where: { id: data.topicId } });
      if (!topic) throw new AppError('Topic not found', 404);
      if (topic.subjectId !== subject.id) {
        throw new AppError('Topic ID does not match the selected subject', 400);
      }
    }

    // 3. Create Doubt
    const doubt = await prisma.$transaction(async (tx) => {
      const newDoubt = await tx.doubt.create({
        data: {
          title: data.title,
          description: data.description,
          studentId: studentProfileId,
          departmentId: data.departmentId,
          subjectId: data.subjectId,
          topicId: data.topicId, // Optional
          status: 'SUBMITTED'
        }
      });

      await tx.activityLog.create({
        data: {
          doubtId: newDoubt.id,
          action: 'SUBMITTED',
          userId: userId,
        }
      });

      return newDoubt;
    });

    // 4. Trigger Routing Engine asynchronously
    setImmediate(() => {
      RoutingService.routeDoubt(doubt.id).catch(console.error);
    });

    return doubt;
  }
}
