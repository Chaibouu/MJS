import { z } from "zod";

export const createAssociationPartenaireSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(255),
  type: z.string().max(80).optional(),
  contact: z.string().optional(),
  typeAppui: z.string().max(120).optional(),
  projetsConcernes: z.string().optional(),
});

export const updateAssociationPartenaireSchema = createAssociationPartenaireSchema.partial();

export type CreateAssociationPartenaireData = z.infer<typeof createAssociationPartenaireSchema>;
export type UpdateAssociationPartenaireData = z.infer<typeof updateAssociationPartenaireSchema>;
