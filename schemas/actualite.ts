import { z } from "zod";

export const createActualiteSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  link: z.union([z.string().url(), z.literal("")]).optional(),
});

export const updateActualiteSchema = createActualiteSchema.partial();

export type CreateActualiteData = z.infer<typeof createActualiteSchema>;
export type UpdateActualiteData = z.infer<typeof updateActualiteSchema>;
