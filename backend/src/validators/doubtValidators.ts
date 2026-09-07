import { z } from 'zod';

export const submitDoubtSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10).max(2000),
    departmentId: z.string().uuid(),
    subjectId: z.string().uuid(),
    topicId: z.string().uuid().optional(),
  })
});
