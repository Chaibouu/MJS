import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-users-auth";
import { getUsers } from "@/data/user";

export const dynamic = "force-dynamic";

/**
 * GET /api/users
 * Récupère la liste des utilisateurs (réservé aux ADMIN).
 * Query: ?page=1&limit=50&search=...
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10) || 50));
    const search = searchParams.get("search") ?? undefined;

    const result = await getUsers({ page, limit, search });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur GET /api/users:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
