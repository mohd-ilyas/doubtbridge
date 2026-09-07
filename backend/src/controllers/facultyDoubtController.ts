import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AppError } from '../utils/errors';
import { RoutingService } from '../services/routingService';

export const getAssignedDoubts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faculty = await prisma.facultyProfile.findUnique({ where: { userId: req.user!.id } });
    if (!faculty) throw new AppError('Faculty profile not found', 404);

    const doubts = await prisma.doubt.findMany({
      where: {
        assignments: {
          some: { facultyId: faculty.id }
        }
      },
      include: {
        subject: true,
        department: true,
        topic: true
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ success: true, data: doubts });
  } catch (error) { next(error); }
};

export const acceptDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId }, include: { assignments: { include: { faculty: true }, orderBy: { assignedAt: 'desc' }, take: 1 } } });
    
    if (!doubt || doubt.assignments[0]?.faculty.userId !== req.user!.id) {
      throw new AppError('Doubt not found or not assigned to you', 403);
    }
    
    if (doubt.status !== 'ASSIGNED') {
      throw new AppError('Doubt must be in ASSIGNED status to accept', 400);
    }

    const updated = await prisma.$transaction([
      prisma.doubt.update({ where: { id: doubtId }, data: { status: 'ACCEPTED' } }),
      prisma.activityLog.create({ data: { doubtId, action: 'ACCEPTED', userId: req.user!.id } })
    ]);

    res.status(200).json({ success: true, message: 'Doubt accepted', data: updated[0] });
  } catch (error) { next(error); }
};

export const startWorkingOnDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId }, include: { assignments: { include: { faculty: true }, orderBy: { assignedAt: 'desc' }, take: 1 } } });
    
    if (!doubt || doubt.assignments[0]?.faculty.userId !== req.user!.id) {
      throw new AppError('Doubt not found or not assigned to you', 403);
    }
    
    if (doubt.status !== 'ACCEPTED') {
      throw new AppError('Doubt must be in ACCEPTED status to start working', 400);
    }

    const updated = await prisma.$transaction([
      prisma.doubt.update({ where: { id: doubtId }, data: { status: 'IN_PROGRESS' } }),
      prisma.activityLog.create({ data: { doubtId, action: 'IN_PROGRESS', userId: req.user!.id } })
    ]);

    res.status(200).json({ success: true, message: 'Doubt marked as in progress', data: updated[0] });
  } catch (error) { next(error); }
};

export const respondToDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const { content } = req.body;
    
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    if (!doubt) throw new AppError('Doubt not found', 404);

    if (doubt.status !== 'IN_PROGRESS' && doubt.status !== 'ANSWERED') {
      throw new AppError('Doubt must be IN_PROGRESS to respond', 400);
    }

    const statusToUpdate = (doubt.status === 'IN_PROGRESS') ? 'ANSWERED' : doubt.status;

    const response = await prisma.$transaction([
      prisma.doubtResponse.create({ data: { doubtId, userId: req.user!.id, content } }),
      prisma.doubt.update({ where: { id: doubtId }, data: { status: statusToUpdate } })
    ]);

    res.status(201).json({ success: true, message: 'Response added', data: response[0] });
  } catch (error) { next(error); }
};

export const transferDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    
    if (!doubt || (doubt.status !== 'ASSIGNED' && doubt.status !== 'ACCEPTED')) {
      throw new AppError('Cannot transfer doubt in current status', 400);
    }

    await prisma.$transaction([
      prisma.doubt.update({ where: { id: doubtId }, data: { status: 'QUEUED' } }),
      prisma.activityLog.create({ data: { doubtId, action: 'TRANSFERRED', userId: req.user!.id } })
    ]);

    // Re-route
    setImmediate(() => { RoutingService.routeDoubt(doubtId).catch(console.error); });

    res.status(200).json({ success: true, message: 'Doubt transferred successfully' });
  } catch (error) { next(error); }
};
