import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { updateAssociationMembreSchema } from "@/schemas/association-membre";

export const dynamic = "force-dynamic";

function parseBody(formData: FormData) {
  const g = (k: string) => (formData.get(k) as string)?.trim();
  const date = (k: string) => {
    const v = formData.get(k) as string;
    if (!v) return undefined;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };
  const cot = formData.get("cotisationAJour");
  return {
    numeroMembre: g("numeroMembre") || undefined,
    nom: g("nom"),
    prenom: g("prenom"),
    sexe: (g("sexe") === "MASCULIN" || g("sexe") === "FEMININ" ? g("sexe") : undefined) as
      | "MASCULIN"
      | "FEMININ"
      | undefined,
    dateNaissance: date("dateNaissance"),
    adresse: g("adresse") || undefined,
    telephone: g("telephone") || undefined,
    email: g("email") || undefined,
    role: g("role") || undefined,
    dateAdhesion: date("dateAdhesion"),
    statut: g("statut") || undefined,
    cotisationAJour: cot === "true" || cot === "1" ? true : cot === "false" || cot === "0" ? false : undefined,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  try {
    const { id, mid } = await params;
    const m = await db.associationMembre.findFirst({
      where: { id: mid, associationId: id },
    });
    return m
      ? NextResponse.json(m)
      : NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
  } catch (e) {
    console.error("GET /api/associations/[id]/membres/[mid]:", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  try {
    const { id, mid } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationMembre.findFirst({
      where: { id: mid, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    const formData = await req.formData();
    const body = parseBody(formData);
    const parsed = updateAssociationMembreSchema.safeParse(body);
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
    const updated = await db.associationMembre.update({
      where: { id: mid },
      data: update as Parameters<typeof db.associationMembre.update>[0]["data"],
    });
    return NextResponse.json({ data: updated, message: "Membre mis à jour" });
  } catch (e) {
    console.error("PATCH /api/associations/[id]/membres/[mid]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  try {
    const { id, mid } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationMembre.findFirst({
      where: { id: mid, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }
    await db.associationMembre.delete({ where: { id: mid } });
    return NextResponse.json({ message: "Membre supprimé" });
  } catch (e) {
    console.error("DELETE /api/associations/[id]/membres/[mid]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
