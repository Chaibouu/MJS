import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  link: z.union([z.string().url(), z.literal("")]).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleData = z.infer<typeof createArticleSchema>;
export type UpdateArticleData = z.infer<typeof updateArticleSchema>;

/** Schéma du formulaire article (création + édition). */
export const articleFormSchema = z.object({
  title: z.string().min(1, "Titre requis").max(255),
  description: z.string().optional(),
  link: z.union([z.string().url("URL invalide"), z.literal("")]).optional(),
  mainImage: z.instanceof(File).optional().nullable(),
  gallery: z.array(z.instanceof(File)).optional(),
  galleryRemove: z.array(z.string()).optional(),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;
