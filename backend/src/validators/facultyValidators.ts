import { z } from 'zod';

export const setAvailabilitySchema = z.object({
  body: z.object({
    availableFrom: z.string().datetime().nullable(),
    availableUntil: z.string().datetime().nullable(),
  }).refine(data => {
    if (data.availableFrom && data.availableUntil) {
      return new Date(data.availableFrom) < new Date(data.availableUntil);
    }
    return true;
  }, { message: "availableFrom must be before availableUntil" })
});

export const addExpertiseSchema = z.object({
  body: z.object({
    subjectId: z.string().uuid(),
    topicIds: z.array(z.string().uuid()).optional()
  })
});
