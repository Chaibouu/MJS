import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { updateAssociationActiviteSchema } from "@/schemas/association-activite";

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
  { params }: { params: Promise<{ id: string; aid: string }> }
) {
  try {
    const { id, aid } = await params;
    const a = await db.associationActivite.findFirst({
      where: { id: aid, associationId: id },
    });
    return a
      ? NextResponse.json(a)
      : NextResponse.json({ error: "Activité non trouvée" }, { status: 404 });
  } catch (e) {
    console.error("GET /api/associations/[id]/activites/[aid]:", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; aid: string }> }
) {
  try {
    const { id, aid } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationActivite.findFirst({
      where: { id: aid, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Activité non trouvée" }, { status: 404 });
    }

    const formData = await req.formData();
    const body = parseBody(formData);
    const parsed = updateAssociationActiviteSchema.safeParse(body);
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
    const updated = await db.associationActivite.update({
      where: { id: aid },
      data: update as Parameters<typeof db.associationActivite.update>[0]["data"],
    });
    return NextResponse.json({ data: updated, message: "Activité mise à jour" });
  } catch (e) {
    console.error("PATCH /api/associations/[id]/activites/[aid]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; aid: string }> }
) {
  try {
    const { id, aid } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationActivite.findFirst({
      where: { id: aid, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Activité non trouvée" }, { status: 404 });
    }
    await db.associationActivite.delete({ where: { id: aid } });
    return NextResponse.json({ message: "Activité supprimée" });
  } catch (e) {
    console.error("DELETE /api/associations/[id]/activites/[aid]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
