import { z } from 'zod';

export const createFacultySchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    departmentId: z.string().uuid(),
    maxWorkload: z.number().int().positive().optional()
  })
});
