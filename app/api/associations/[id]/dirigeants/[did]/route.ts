import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { updateAssociationDirigeantSchema } from "@/schemas/association-dirigeant";
import {
  uploadAssociationDirigeantPiece,
  deleteAssociationFile,
} from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; did: string }> }
) {
  try {
    const { id, did } = await params;
    const d = await db.associationDirigeant.findFirst({
      where: { id: did, associationId: id },
    });
    return d
      ? NextResponse.json(d)
      : NextResponse.json({ error: "Dirigeant non trouvé" }, { status: 404 });
  } catch (e) {
    console.error("GET /api/associations/[id]/dirigeants/[did]:", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; did: string }> }
) {
  try {
    const { id, did } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationDirigeant.findFirst({
      where: { id: did, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Dirigeant non trouvé" }, { status: 404 });
    }

    const formData = await req.formData();
    const body = {
      nom: (formData.get("nom") as string)?.trim(),
      prenom: (formData.get("prenom") as string)?.trim(),
      fonction: (formData.get("fonction") as string)?.trim(),
      telephone: (formData.get("telephone") as string)?.trim() || undefined,
      email: (formData.get("email") as string)?.trim() || undefined,
      dateDebutMandat: formData.get("dateDebutMandat")
        ? new Date((formData.get("dateDebutMandat") as string))
        : undefined,
      dateFinMandat: formData.get("dateFinMandat")
        ? new Date((formData.get("dateFinMandat") as string))
        : undefined,
    };
    const parsed = updateAssociationDirigeantSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...parsed.data };
    const f = formData.get("pieceIdentite") as File | null;
    if (f && f instanceof File && f.size > 0) {
      const res = await uploadAssociationDirigeantPiece(f, id, did);
      data.pieceIdentitePath = res.path;
    }

    const updated = await db.associationDirigeant.update({
      where: { id: did },
      data: data as Parameters<typeof db.associationDirigeant.update>[0]["data"],
    });
    return NextResponse.json({ data: updated, message: "Dirigeant mis à jour" });
  } catch (e) {
    console.error("PATCH /api/associations/[id]/dirigeants/[did]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; did: string }> }
) {
  try {
    const { id, did } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationDirigeant.findFirst({
      where: { id: did, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Dirigeant non trouvé" }, { status: 404 });
    }
    if (existing.pieceIdentitePath) {
      await deleteAssociationFile(existing.pieceIdentitePath);
    }
    await db.associationDirigeant.delete({ where: { id: did } });
    return NextResponse.json({ message: "Dirigeant supprimé" });
  } catch (e) {
    console.error("DELETE /api/associations/[id]/dirigeants/[did]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
