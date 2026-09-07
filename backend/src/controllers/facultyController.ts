import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AppError } from '../utils/errors';

export const setAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { availableFrom, availableUntil } = req.body;
    
    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!faculty) throw new AppError('Faculty profile not found', 404);

    const updated = await prisma.facultyProfile.update({
      where: { id: faculty.id },
      data: { availableFrom, availableUntil }
    });

    // TODO: Emit an event to re-evaluate queued doubts

    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const addExpertise = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subjectId, topicIds } = req.body;
    
    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!faculty) throw new AppError('Faculty profile not found', 404);

    await prisma.facultyExpertise.upsert({
      where: { facultyProfileId_subjectId: { facultyProfileId: faculty.id, subjectId } },
      create: { facultyProfileId: faculty.id, subjectId },
      update: {}
    });

    if (topicIds && Array.isArray(topicIds)) {
      for (const topicId of topicIds) {
        await prisma.facultyTopicExpertise.upsert({
          where: { facultyProfileId_topicId: { facultyProfileId: faculty.id, topicId } },
          create: { facultyProfileId: faculty.id, topicId },
          update: {}
        });
      }
    }

    res.status(200).json({ success: true, message: 'Expertise updated successfully' });
  } catch (error) { next(error); }
};
