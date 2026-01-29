import { NextRequest, NextResponse } from "next/server";
import { join, resolve, relative } from "path";
import { existsSync, readFileSync } from "fs";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = "uploads/articles/main";
const MIMES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/**
 * GET /api/uploads/articles/main/[filename]
 * Sert l'image principale d'un article (uploads/articles/main/).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename || !/^[a-zA-Z0-9_.-]+\.[a-z]+$/.test(filename)) {
    return NextResponse.json({ error: "Nom de fichier invalide" }, { status: 400 });
  }

  const base = resolve(process.cwd(), UPLOAD_DIR);
  const filepath = resolve(base, filename);
  const rel = relative(base, filepath);

  if (rel.startsWith("..") || rel.includes("..") || !existsSync(filepath)) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIMES[ext] ?? "application/octet-stream";

  try {
    const buffer = readFileSync(filepath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur lecture fichier" }, { status: 500 });
  }
}
