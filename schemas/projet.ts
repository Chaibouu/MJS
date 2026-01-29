import { z } from "zod";

export const createProjetSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  link: z.union([z.string().url(), z.literal("")]).optional(),
});

export const updateProjetSchema = createProjetSchema.partial();

export type CreateProjetData = z.infer<typeof createProjetSchema>;
export type UpdateProjetData = z.infer<typeof updateProjetSchema>;
