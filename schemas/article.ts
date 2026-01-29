import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  link: z.union([z.string().url(), z.literal("")]).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleData = z.infer<typeof createArticleSchema>;
export type UpdateArticleData = z.infer<typeof updateArticleSchema>;
