import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2),
  })
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    departmentId: z.string().uuid(),
  })
});

export const createTopicSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    subjectId: z.string().uuid(),
  })
});
