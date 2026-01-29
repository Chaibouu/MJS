import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { deleteAssociationFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params;
    const d = await db.associationDocument.findFirst({
      where: { id: docId, associationId: id },
    });
    return d
      ? NextResponse.json(d)
      : NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
  } catch (e) {
    console.error("GET /api/associations/[id]/documents/[docId]:", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params;
    const auth = await requireAssociationAccess(req, id);
    if (!auth.ok) return auth.response;

    const existing = await db.associationDocument.findFirst({
      where: { id: docId, associationId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }
    await deleteAssociationFile(existing.path);
    await db.associationDocument.delete({ where: { id: docId } });
    return NextResponse.json({ message: "Document supprimé" });
  } catch (e) {
    console.error("DELETE /api/associations/[id]/documents/[docId]:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
