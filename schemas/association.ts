import { z } from "zod";

const optionalString = z.string().optional();
const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();
const optionalEmail = z.union([z.string().email(), z.literal("")]).optional();

export const createAssociationSchema = z.object({
  nomOfficiel: z.string().min(1, "Nom officiel requis").max(255),
  description: optionalString,
  emailContact: z.string().email("Email de contact invalide"),
  numeroRecepisse: optionalString,
  autoriteReconnaissance: optionalString,
  statutJuridique: optionalString,
  nombreMembres: z.coerce.number().int().min(0).optional().nullable(),
  impactSocial: optionalString,
  dateCreation: z.coerce.date().optional().nullable(),
  pays: optionalString,
  region: optionalString,
  villeCommune: optionalString,
  quartier: optionalString,
  adressePhysique: optionalString,
  telephonePrincipal: optionalString,
  telephoneSecondaire: optionalString,
  emailOfficiel: optionalEmail,
  siteWeb: optionalUrl,
  reseauxSociaux: z.record(z.string(), z.string()).optional().nullable(),
  domaineIntervention: optionalString,
  missionPrincipale: optionalString,
  objectifsGeneraux: z.array(z.string()).optional().nullable(),
  activitesPrincipales: z.array(z.string()).optional().nullable(),
  publicCible: optionalString,
  zoneIntervention: optionalString,
});

export const updateAssociationSchema = createAssociationSchema.partial();

export type CreateAssociationData = z.infer<typeof createAssociationSchema>;
export type UpdateAssociationData = z.infer<typeof updateAssociationSchema>;
