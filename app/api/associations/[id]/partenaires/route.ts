import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { createAssociationPartenaireSchema } from "@/schemas/association-partenaire";

export const dynamic = "force-dynamic";

function parseBody(formData: FormData) {
  const g = (k: string) => (formData.get(k) as string)?.trim();
  return {
    nom: g("nom"),
    type: g("type") || undefined,
    contact: g("contact") || undefined,
    typeAppui: g("typeAppui") || undefined,
    projetsConcernes: g("projetsConcernes") || undefined,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await db.associationPartenaire.findMany({
      where: { associationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/associations/[id]/partenaires:", e);
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
    const parsed = createAssociationPartenaireSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const created = await db.associationPartenaire.create({
      data: {
        associationId: id,
        nom: d.nom,
        type: d.type ?? null,
        contact: d.contact ?? null,
        typeAppui: d.typeAppui ?? null,
        projetsConcernes: d.projetsConcernes ?? null,
      },
    });
    return NextResponse.json(
      { data: created, message: "Partenaire ajouté" },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/associations/[id]/partenaires:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
