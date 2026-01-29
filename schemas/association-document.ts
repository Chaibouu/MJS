import { z } from "zod";

export const ASSOCIATION_DOCUMENT_TYPES = [
  "RAPPORT_ACTIVITE",
  "PV_REUNION",
  "PV_AG",
  "PHOTO_VIDEO",
  "ATTESTATION",
] as const;

export const createAssociationDocumentSchema = z.object({
  type: z.enum(ASSOCIATION_DOCUMENT_TYPES),
  titre: z.string().max(255).optional(),
});

export const updateAssociationDocumentSchema = z.object({
  type: z.enum(ASSOCIATION_DOCUMENT_TYPES).optional(),
  titre: z.string().max(255).optional(),
});

export type CreateAssociationDocumentData = z.infer<typeof createAssociationDocumentSchema>;
export type UpdateAssociationDocumentData = z.infer<typeof updateAssociationDocumentSchema>;
