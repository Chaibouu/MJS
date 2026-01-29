import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-users-auth";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { updateAssociationSchema } from "@/schemas/association";
import { uploadAssociationSlotFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

const SLOTS = ["logo", "statuts", "reglement", "recepisse", "pv"] as const;
const SLOT_TO_FIELD: Record<(typeof SLOTS)[number], string> = {
  logo: "logoPath",
  statuts: "statutsPath",
  reglement: "reglementInterieurPath",
  recepisse: "recepissePath",
  pv: "pvCreationPath",
};

function parseFormBody(formData: FormData) {
  const g = (k: string) => (formData.get(k) as string)?.trim();
  const num = (k: string) => {
    const v = formData.get(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };
  const date = (k: string) => {
    const v = formData.get(k) as string;
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  const json = (k: string): string[] | undefined => {
    const v = formData.get(k) as string;
    if (!v) return undefined;
    try {
      const a = JSON.parse(v) as unknown;
      return Array.isArray(a) ? a.filter((x) => typeof x === "string") : undefined;
    } catch {
      return undefined;
    }
  };
  const jsonObj = (k: string): Record<string, string> | undefined => {
    const v = formData.get(k) as string;
    if (!v) return undefined;
    try {
      const o = JSON.parse(v) as unknown;
      return o && typeof o === "object" && !Array.isArray(o)
        ? (o as Record<string, string>)
        : undefined;
    } catch {
      return undefined;
    }
  };

  return {
    nomOfficiel: g("nomOfficiel"),
    description: g("description"),
    emailContact: g("emailContact"),
    numeroRecepisse: g("numeroRecepisse"),
    autoriteReconnaissance: g("autoriteReconnaissance"),
    statutJuridique: g("statutJuridique"),
    nombreMembres: num("nombreMembres"),
    impactSocial: g("impactSocial"),
    dateCreation: date("dateCreation"),
    pays: g("pays"),
    region: g("region"),
    villeCommune: g("villeCommune"),
    quartier: g("quartier"),
    adressePhysique: g("adressePhysique"),
    telephonePrincipal: g("telephonePrincipal"),
    telephoneSecondaire: g("telephoneSecondaire"),
    emailOfficiel: g("emailOfficiel"),
    siteWeb: g("siteWeb"),
    reseauxSociaux: jsonObj("reseauxSociaux"),
    domaineIntervention: g("domaineIntervention"),
    missionPrincipale: g("missionPrincipale"),
    objectifsGeneraux: json("objectifsGeneraux"),
    activitesPrincipales: json("activitesPrincipales"),
    publicCible: g("publicCible"),
    zoneIntervention: g("zoneIntervention"),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const a = await db.association.findFirst({
      where: { id, isDeleted: false },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, firstName: true, lastName: true },
        },
        updatedByUser: {
          select: { id: true, name: true, email: true, firstName: true, lastName: true },
        },
        deletedByUser: {
          select: { id: true, name: true, email: true, firstName: true, lastName: true },
        },
        dirigeants: true,
        membres: true,
        activites: true,
        partenaires: true,
        documents: true,
      },
    });
    return a
      ? NextResponse.json(a)
      : NextResponse.json({ error: "Association non trouvée" }, { status: 404 });
  } catch (e) {
    console.error("GET /api/associations/[id]:", e);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const raw = parseFormBody(formData);
    const body: Record<string, unknown> = {};
    if (raw.nomOfficiel !== undefined && raw.nomOfficiel !== "") body.nomOfficiel = raw.nomOfficiel;
    if (raw.description !== undefined) body.description = raw.description ?? null;
    if (raw.emailContact !== undefined && raw.emailContact !== "") body.emailContact = raw.emailContact;
    if (raw.numeroRecepisse !== undefined) body.numeroRecepisse = raw.numeroRecepisse ?? null;
    if (raw.autoriteReconnaissance !== undefined) body.autoriteReconnaissance = raw.autoriteReconnaissance ?? null;
    if (raw.statutJuridique !== undefined) body.statutJuridique = raw.statutJuridique ?? null;
    if (raw.nombreMembres !== undefined) body.nombreMembres = raw.nombreMembres ?? null;
    if (raw.impactSocial !== undefined) body.impactSocial = raw.impactSocial ?? null;
    if (raw.dateCreation !== undefined) body.dateCreation = raw.dateCreation ?? null;
    if (raw.pays !== undefined) body.pays = raw.pays ?? null;
    if (raw.region !== undefined) body.region = raw.region ?? null;
    if (raw.villeCommune !== undefined) body.villeCommune = raw.villeCommune ?? null;
    if (raw.quartier !== undefined) body.quartier = raw.quartier ?? null;
    if (raw.adressePhysique !== undefined) body.adressePhysique = raw.adressePhysique ?? null;
    if (raw.telephonePrincipal !== undefined) body.telephonePrincipal = raw.telephonePrincipal ?? null;
    if (raw.telephoneSecondaire !== undefined) body.telephoneSecondaire = raw.telephoneSecondaire ?? null;
    if (raw.emailOfficiel !== undefined) body.emailOfficiel = raw.emailOfficiel ?? null;
    if (raw.siteWeb !== undefined) body.siteWeb = raw.siteWeb ?? null;
    if (raw.reseauxSociaux !== undefined) body.reseauxSociaux = raw.reseauxSociaux ?? null;
    if (raw.domaineIntervention !== undefined) body.domaineIntervention = raw.domaineIntervention ?? null;
    if (raw.missionPrincipale !== undefined) body.missionPrincipale = raw.missionPrincipale ?? null;
    if (raw.objectifsGeneraux !== undefined) body.objectifsGeneraux = raw.objectifsGeneraux ?? null;
    if (raw.activitesPrincipales !== undefined) body.activitesPrincipales = raw.activitesPrincipales ?? null;
    if (raw.publicCible !== undefined) body.publicCible = raw.publicCible ?? null;
    if (raw.zoneIntervention !== undefined) body.zoneIntervention = raw.zoneIntervention ?? null;

    const parsed = updateAssociationSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const slotUpdates: Record<string, string> = {};
    for (const slot of SLOTS) {
      const f = formData.get(slot) as File | null;
      if (f && f instanceof File && f.size > 0) {
        const res = await uploadAssociationSlotFile(f, id, slot);
        const field = SLOT_TO_FIELD[slot];
        slotUpdates[field] = res.path;
      }
    }

    const data: Record<string, unknown> = { ...parsed.data, ...slotUpdates, updatedBy: auth.userId };
    const updated = await db.association.update({
      where: { id },
      data: data as Parameters<typeof db.association.update>[0]["data"],
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true, firstName: true, lastName: true },
        },
        updatedByUser: {
          select: { id: true, name: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({
      data: updated,
      message: "Association mise à jour avec succès",
    });
  } catch (e) {
    console.error("PATCH /api/associations/[id]:", e);
    const msg = e instanceof Error ? e.message : "Erreur lors de la mise à jour";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const existing = await db.association.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json({ error: "Association non trouvée" }, { status: 404 });
    }

    await db.association.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: auth.adminId,
      },
    });

    return NextResponse.json({ message: "Association supprimée" });
  } catch (e) {
    console.error("DELETE /api/associations/[id]:", e);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
