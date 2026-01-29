import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { updateAssociationPartenaireSchema } from "@/schemas/association-partenaire";

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
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  try {
    const { id, pid } = await params;
    const p = await db.associationPartenaire.findFirst({
      where: { id: pid, associationId: id },
    });
    return p
      ? NextResponse.json(p)
      : NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 });
  } catch (e) {
    console.error("GET /api/associations/[id]/partenaires/[pid]:", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  try {
    const { id, pid } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationPartenaire.findFirst({
      where: { id: pid, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 });
    }

    const formData = await req.formData();
    const body = parseBody(formData);
    const parsed = updateAssociationPartenaireSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = parsed.data as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    for (const k of Object.keys(data)) {
      const v = (data as Record<string, unknown>)[k];
      if (v !== undefined) update[k] = v;
    }
    const updated = await db.associationPartenaire.update({
      where: { id: pid },
      data: update as Parameters<typeof db.associationPartenaire.update>[0]["data"],
    });
    return NextResponse.json({ data: updated, message: "Partenaire mis à jour" });
  } catch (e) {
    console.error("PATCH /api/associations/[id]/partenaires/[pid]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  try {
    const { id, pid } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationPartenaire.findFirst({
      where: { id: pid, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Partenaire non trouvé" }, { status: 404 });
    }
    await db.associationPartenaire.delete({ where: { id: pid } });
    return NextResponse.json({ message: "Partenaire supprimé" });
  } catch (e) {
    console.error("DELETE /api/associations/[id]/partenaires/[pid]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
