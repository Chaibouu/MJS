import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { createAssociationDocumentSchema } from "@/schemas/association-document";
import { uploadAssociationDocument, deleteAssociationFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await db.associationDocument.findMany({
      where: { associationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/associations/[id]/documents:", e);
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
    const type = (formData.get("type") as string)?.trim();
    const titre = (formData.get("titre") as string)?.trim();
    const parsed = createAssociationDocumentSchema.safeParse({ type, titre });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const f = formData.get("file") as File | null;
    if (!f || !(f instanceof File) || f.size === 0) {
      return NextResponse.json(
        { error: "Fichier requis (rapport, PV, photo, etc.)" },
        { status: 400 }
      );
    }

    const res = await uploadAssociationDocument(f, id);
    const created = await db.associationDocument.create({
      data: {
        associationId: id,
        type: parsed.data.type,
        titre: parsed.data.titre ?? null,
        path: res.path,
      },
    });
    return NextResponse.json(
      { data: created, message: "Document ajouté" },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/associations/[id]/documents:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
