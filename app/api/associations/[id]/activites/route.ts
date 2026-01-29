import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { createAssociationActiviteSchema } from "@/schemas/association-activite";

export const dynamic = "force-dynamic";

function parseBody(formData: FormData) {
  const g = (k: string) => (formData.get(k) as string)?.trim();
  const date = (k: string) => {
    const v = formData.get(k) as string;
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  return {
    nom: g("nom"),
    description: g("description") || undefined,
    objectif: g("objectif") || undefined,
    dateDebut: date("dateDebut"),
    dateFin: date("dateFin"),
    budget: g("budget") || undefined,
    responsable: g("responsable") || undefined,
    partenaires: g("partenaires") || undefined,
    resultatsImpact: g("resultatsImpact") || undefined,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await db.associationActivite.findMany({
      where: { associationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/associations/[id]/activites:", e);
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
    const parsed = createAssociationActiviteSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const created = await db.associationActivite.create({
      data: {
        associationId: id,
        nom: d.nom,
        description: d.description ?? null,
        objectif: d.objectif ?? null,
        dateDebut: d.dateDebut ?? null,
        dateFin: d.dateFin ?? null,
        budget: d.budget ?? null,
        responsable: d.responsable ?? null,
        partenaires: d.partenaires ?? null,
        resultatsImpact: d.resultatsImpact ?? null,
      },
    });
    return NextResponse.json(
      { data: created, message: "Activité ajoutée" },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/associations/[id]/activites:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
