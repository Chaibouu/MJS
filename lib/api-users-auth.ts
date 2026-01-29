import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getUserIdFromToken } from "@/lib/tokens";
import { db } from "@/lib/db";

export type AdminAuthResult =
  | { ok: true; adminId: string }
  | { ok: false; response: NextResponse };

/**
 * Vérifie que la requête est authentifiée et que l'utilisateur est ADMIN.
 * À utiliser dans les routes /api/users/*.
 */
export async function requireAdminApi(): Promise<AdminAuthResult> {
  const headersList = await headers();
  const token = headersList.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "Token manquant" }, { status: 401 }) };
  }

  const userId = await getUserIdFromToken(token);
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token invalide ou expiré" }, { status: 403 }),
    };
  }

  const current = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, isDeleted: true },
  });
  if (!current || current.isDeleted) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Utilisateur introuvable" }, { status: 403 }),
    };
  }
  if (current.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, adminId: userId };
}
