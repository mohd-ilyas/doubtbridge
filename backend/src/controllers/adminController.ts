import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

export const createFaculty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, departmentId, maxWorkload } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'FACULTY',
        facultyProfile: {
          create: {
            departmentId,
            maxWorkload: maxWorkload || 5,
          }
        }
      },
      include: { facultyProfile: true }
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) { next(error); }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalFaculty = await prisma.user.count({ where: { role: 'FACULTY' } });
    const activeDoubts = await prisma.doubt.count({ where: { status: { in: ['SUBMITTED', 'QUEUED', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'] } } });
    const resolvedDoubts = await prisma.doubt.count({ where: { status: 'RESOLVED' } });
    
    res.status(200).json({
      success: true,
      data: { totalStudents, totalFaculty, activeDoubts, resolvedDoubts }
    });
  } catch (error) { next(error); }
};
