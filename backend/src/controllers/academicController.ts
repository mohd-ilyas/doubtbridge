import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      include: { subjects: true }
    });
    res.status(200).json({ success: true, data: departments });
  } catch (error) { next(error); }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dept = await prisma.department.create({ data: req.body });
    res.status(201).json({ success: true, data: dept });
  } catch (error) { next(error); }
};

export const getSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departmentId = typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
    const subjects = await prisma.subject.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: { topics: true }
    });
    res.status(200).json({ success: true, data: subjects });
  } catch (error) { next(error); }
};

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json({ success: true, data: subject });
  } catch (error) { next(error); }
};

export const getTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subjectId = typeof req.query.subjectId === 'string' ? req.query.subjectId : undefined;
    const topics = await prisma.topic.findMany({ where: subjectId ? { subjectId } : undefined });
    res.status(200).json({ success: true, data: topics });
  } catch (error) { next(error); }
};

export const createTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = await prisma.topic.create({ data: req.body });
    res.status(201).json({ success: true, data: topic });
  } catch (error) { next(error); }
};
