import { Request, Response, NextFunction } from 'express';
import { DoubtService } from '../services/doubtService';
import prisma from '../prisma';
import { AppError } from '../utils/errors';

export const submitDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentId = req.user!.id;
    const userId = req.user!.id;
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!studentProfile) throw new AppError('Student profile not found', 404);
    
    const doubt = await DoubtService.submitDoubt(req.body, studentProfile.id, userId);
    
    res.status(201).json({ success: true, data: doubt });
  } catch (error) { next(error); }
};

export const getStudentDoubts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile) throw new AppError('Profile not found', 404);

    const doubts = await prisma.doubt.findMany({
      where: { studentId: studentProfile.id },
      include: {
        department: true,
        subject: true,
        topic: true,
        responses: {
          orderBy: { createdAt: 'asc' }
        },
        assignments: {
          include: { faculty: { include: { user: { select: { name: true } } } } },
          orderBy: { assignedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const respondentIds = [...new Set(doubts.flatMap((doubt) => doubt.responses.map((response) => response.userId)))];
    const respondents = await prisma.user.findMany({
      where: { id: { in: respondentIds } },
      select: { id: true, name: true, role: true }
    });
    const usersById = new Map(respondents.map((user) => [user.id, user]));
    const doubtsWithResponses = doubts.map((doubt) => ({
      ...doubt,
      responses: doubt.responses.map((response) => ({ ...response, user: usersById.get(response.userId) }))
    }));

    res.status(200).json({ success: true, data: doubtsWithResponses });
  } catch (error) { next(error); }
};
