import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api/helpers";
import { getUserIdFromToken } from "@/lib/tokens";
import { DiplomeSchema } from "@/schemas/fildOfStudies";

export async function GET() {
  try {
    const fields = await db.diplome.findMany({
      where: { isDeleted: false },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(fields);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
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

    // Vérification de l'unicité
    const existingField = await db.diplome.findFirst({
      where: { name, isDeleted: false }
    });

    if (existingField) {
      return NextResponse.json(
        { error: "Ce diplome existe déjà" },
        { status: 409 }
      );
    }

    const newField = await db.diplome.create({
      data: { name }
    });

    return NextResponse.json(
      { data: newField, message: "Diplome créé avec succès" },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}