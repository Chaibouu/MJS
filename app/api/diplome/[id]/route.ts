import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api/helpers";
import { getUserIdFromToken } from "@/lib/tokens";
import { Prisma } from "@prisma/client";
import { DiplomeSchema } from "@/schemas/fildOfStudies";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    const field = await db.diplome.findUnique({
      where: { id, isDeleted: false },
    });
    return field ? NextResponse.json(field) : NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Ajoutez ici les méthodes PUT et DELETE similaires à celles de jobCategory
// (en utilisant prisma.diplome au lieu de prisma.jobCategory)


export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token invalide" }, { status: 403 });
    }

    const body = await req.json();
    const validation = DiplomeSchema.safeParse(body);
    if (!validation.success) return handleApiError(validation.error);

    const { name } = validation.data;

    const updatedField = await db.diplome.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json({data:updatedField,message:"Diplome mise à jour avec succès"});
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Token invalide" }, { status: 403 });
    }

    const deletedAt = new Date();
    const diplomes = await db.diplome.findUnique({
      where: { id, isDeleted: false },
    })


    await db.diplome.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt,
        deletedBy: userId,
        name: `deleted_${deletedAt.getTime()}_${diplomes?.name}`
      },
    });

    return NextResponse.json({ message: "Domaine d'étude supprimé" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Erreur Prisma:", error.message);
    }
    return handleApiError(error);
  }
}