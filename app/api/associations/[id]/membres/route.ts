import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { createAssociationMembreSchema } from "@/schemas/association-membre";

export const dynamic = "force-dynamic";

function parseBody(formData: FormData) {
  const g = (k: string) => (formData.get(k) as string)?.trim();
  const date = (k: string) => {
    const v = formData.get(k) as string;
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  const sex = g("sexe");
  return {
    numeroMembre: g("numeroMembre") || undefined,
    nom: g("nom"),
    prenom: g("prenom"),
    sexe: (sex === "MASCULIN" || sex === "FEMININ" ? sex : undefined) as "MASCULIN" | "FEMININ" | undefined,
    dateNaissance: date("dateNaissance"),
    adresse: g("adresse") || undefined,
    telephone: g("telephone") || undefined,
    email: g("email") || undefined,
    role: g("role") || undefined,
    dateAdhesion: date("dateAdhesion"),
    statut: g("statut") || undefined,
    cotisationAJour: formData.get("cotisationAJour") === "true" || formData.get("cotisationAJour") === "1",
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await db.associationMembre.findMany({
      where: { associationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/associations/[id]/membres:", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const assoc = await db.association.findFirst({
      where: { id, isDeleted: false },
    });
    if (!assoc) {
      return NextResponse.json({ error: "Association non trouvée" }, { status: 404 });
    }

    const formData = await req.formData();
    const body = parseBody(formData);
    const parsed = createAssociationMembreSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const created = await db.associationMembre.create({
      data: {
        associationId: id,
        numeroMembre: d.numeroMembre ?? null,
        nom: d.nom,
        prenom: d.prenom,
        sexe: d.sexe ?? null,
        dateNaissance: d.dateNaissance ?? null,
        adresse: d.adresse ?? null,
        telephone: d.telephone ?? null,
        email: d.email ?? null,
        role: d.role ?? null,
        dateAdhesion: d.dateAdhesion ?? null,
        statut: d.statut ?? null,
        cotisationAJour: d.cotisationAJour ?? null,
      },
    });
    return NextResponse.json(
      { data: created, message: "Membre ajouté" },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/associations/[id]/membres:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
