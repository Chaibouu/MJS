import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAssociationAccess } from "@/lib/api-association-auth";
import { createAssociationDirigeantSchema } from "@/schemas/association-dirigeant";
import {
  uploadAssociationDirigeantPiece,
  deleteAssociationFile,
} from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await db.associationDirigeant.findMany({
      where: { associationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("GET /api/associations/[id]/dirigeants:", e);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
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
    const parsed = createAssociationDirigeantSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const created = await db.associationDirigeant.create({
      data: {
        associationId: id,
        nom: parsed.data.nom,
        prenom: parsed.data.prenom,
        fonction: parsed.data.fonction,
        telephone: parsed.data.telephone ?? null,
        email: parsed.data.email ?? null,
        dateDebutMandat: parsed.data.dateDebutMandat ?? null,
        dateFinMandat: parsed.data.dateFinMandat ?? null,
      },
    });

    const f = formData.get("pieceIdentite") as File | null;
    if (f && f instanceof File && f.size > 0) {
      const res = await uploadAssociationDirigeantPiece(f, id, created.id);
      await db.associationDirigeant.update({
        where: { id: created.id },
        data: { pieceIdentitePath: res.path },
      });
    }

    const updated = await db.associationDirigeant.findUnique({
      where: { id: created.id },
    });
    return NextResponse.json(
      { data: updated, message: "Dirigeant ajouté" },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/associations/[id]/dirigeants:", e);
    const msg = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
