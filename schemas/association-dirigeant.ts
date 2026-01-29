import { z } from "zod";

export const createAssociationDirigeantSchema = z.object({
  nom: z.string().min(1, "Nom requis").max(120),
  prenom: z.string().min(1, "Prénom requis").max(120),
  fonction: z.string().min(1, "Fonction requise").max(120),
  telephone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  dateDebutMandat: z.coerce.date().optional(),
  dateFinMandat: z.coerce.date().optional(),
});

export const updateAssociationDirigeantSchema = createAssociationDirigeantSchema.partial();

export type CreateAssociationDirigeantData = z.infer<typeof createAssociationDirigeantSchema>;
export type UpdateAssociationDirigeantData = z.infer<typeof updateAssociationDirigeantSchema>;
