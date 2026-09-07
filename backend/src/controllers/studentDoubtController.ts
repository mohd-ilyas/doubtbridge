import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AppError } from '../utils/errors';
import { RoutingService } from '../services/routingService';

export const resolveDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    
    if (!doubt) throw new AppError('Doubt not found', 404);
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile || doubt.studentId !== studentProfile.id) throw new AppError('Not authorized', 403);
    if (doubt.status !== 'ANSWERED') throw new AppError('Only ANSWERED doubts can be resolved', 400);

    const updated = await prisma.$transaction([
      prisma.doubt.update({ where: { id: doubtId }, data: { status: 'RESOLVED' } }),
      prisma.activityLog.create({ data: { doubtId, action: 'RESOLVED', userId: req.user!.id } })
    ]);

    // Retrying queued doubts for the department since workload has decreased
    setImmediate(() => { RoutingService.retryQueuedDoubts(doubt.departmentId).catch(console.error); });

    res.status(200).json({ success: true, data: updated[0] });
  } catch (error) { next(error); }
};

export const reopenDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    
    if (!doubt) throw new AppError('Doubt not found', 404);
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!studentProfile || doubt.studentId !== studentProfile.id) throw new AppError('Not authorized', 403);
    if (doubt.status !== 'RESOLVED' && doubt.status !== 'ANSWERED') {
      throw new AppError('Invalid status for reopen', 400);
    }

    await prisma.$transaction([
      prisma.doubt.update({ where: { id: doubtId }, data: { status: 'REOPENED' } }),
      prisma.activityLog.create({ data: { doubtId, action: 'REOPENED', userId: req.user!.id } })
    ]);

    // Re-route since it's reopened
    setImmediate(() => { RoutingService.routeDoubt(doubtId).catch(console.error); });

    res.status(200).json({ success: true, message: 'Doubt reopened successfully' });
  } catch (error) { next(error); }
};

export const closeDoubt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doubtId = req.params.id as string;
    const doubt = await prisma.doubt.findUnique({ where: { id: doubtId } });
    
    if (!doubt) throw new AppError('Doubt not found', 404);
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    
    // Only student owner can close (or Admin, handled by role checks if exposed in admin routes)
    if (!studentProfile || doubt.studentId !== studentProfile.id) {
      // Wait, if it's Admin, req.user.role === 'ADMIN', we can allow it.
      if (req.user!.role !== 'ADMIN') {
        throw new AppError('Not authorized', 403);
      }
    }
    
    if (doubt.status !== 'RESOLVED') {
      throw new AppError('Doubt must be RESOLVED to close', 400);
    }

    const updated = await prisma.$transaction([
      prisma.doubt.update({ where: { id: doubtId }, data: { status: 'CLOSED' } }),
      prisma.activityLog.create({ data: { doubtId, action: 'CLOSED', userId: req.user!.id } })
    ]);

    res.status(200).json({ success: true, message: 'Doubt closed successfully', data: updated[0] });
  } catch (error) { next(error); }
};
