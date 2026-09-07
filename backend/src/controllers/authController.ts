import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import prisma from '../prisma';
import { AppError } from '../utils/errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.registerStudent(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await AuthService.login(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        studentProfile: { select: { id: true, departmentId: true } },
        facultyProfile: { select: { id: true, departmentId: true, maxWorkload: true } }
      }
    });
    if (!user) throw new AppError('User not found', 404);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
