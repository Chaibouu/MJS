import { z } from "zod";

export const createMediaSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
});

export const updateMediaSchema = createMediaSchema.partial();

export type CreateMediaData = z.infer<typeof createMediaSchema>;
export type UpdateMediaData = z.infer<typeof updateMediaSchema>;
