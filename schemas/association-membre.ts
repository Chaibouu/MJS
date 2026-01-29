import { z } from "zod";

export const createAssociationMembreSchema = z.object({
  numeroMembre: z.string().max(50).optional(),
  nom: z.string().min(1, "Nom requis").max(120),
  prenom: z.string().min(1, "Prénom requis").max(120),
  sexe: z.enum(["MASCULIN", "FEMININ"]).optional(),
  dateNaissance: z.coerce.date().optional(),
  adresse: z.string().optional(),
  telephone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal("")),
  role: z.string().max(80).optional(),
  dateAdhesion: z.coerce.date().optional(),
  statut: z.string().max(40).optional(),
  cotisationAJour: z.boolean().optional(),
});

export const updateAssociationMembreSchema = createAssociationMembreSchema.partial();

export type CreateAssociationMembreData = z.infer<typeof createAssociationMembreSchema>;
export type UpdateAssociationMembreData = z.infer<typeof updateAssociationMembreSchema>;
