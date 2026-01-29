import { z } from "zod";

export const createAssociationActiviteSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(255),
  description: z.string().optional(),
  objectif: z.string().optional(),
  dateDebut: z.coerce.date().optional(),
  dateFin: z.coerce.date().optional(),
  budget: z.string().max(120).optional(),
  responsable: z.string().max(255).optional(),
  partenaires: z.string().optional(),
  resultatsImpact: z.string().optional(),
});

export const updateAssociationActiviteSchema = createAssociationActiviteSchema.partial();

export type CreateAssociationActiviteData = z.infer<typeof createAssociationActiviteSchema>;
export type UpdateAssociationActiviteData = z.infer<typeof updateAssociationActiviteSchema>;
