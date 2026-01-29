"use server";

import { revalidatePath } from "next/cache";
import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { uploadProfilePicture } from "@/lib/upload";

export async function revalidateProfil() {
  revalidatePath("/profil");
}

const PICTURE_API = `${process.env.NEXT_PUBLIC_APP_URL}/api/profile/picture`;

type PictureUser = { id: string; profilePicture: string | null; image: string | null; name: string | null; email: string | null };
export type UpdatePictureResult =
  | { success: true; user: PictureUser }
  | { success: false; error: string };

async function normalize(res: unknown): Promise<UpdatePictureResult> {
  type Payload = { success?: boolean; user?: PictureUser; error?: string };
  let data: Payload | null = null;
  if (res instanceof Response) {
    data = (await res.json()) as Payload;
  } else if (res && typeof res === "object" && "error" in (res as object)) {
    return { success: false, error: (res as { error: string }).error };
  } else if (res && typeof res === "object") {
    data = res as Payload;
  }
  if (data?.success && data?.user != null) {
    return { success: true, user: data.user };
  }
  return { success: false, error: data?.error ?? "Réponse invalide" };
}

/**
 * Choisir un avatar prédéfini (/avatar/xxx).
 */
export async function updateProfilePictureAvatar(avatarPath: string): Promise<UpdatePictureResult> {
  const formData = new FormData();
  formData.set("avatar", avatarPath.trim());
  const res = await makeAuthenticatedRequest(PICTURE_API, "POST", formData);
  return normalize(res);
}

/**
 * Upload une image depuis l'appareil (remplace l'ancienne photo de profil).
 * Fait tout côté serveur (FormData reçu directement) pour éviter de perdre le File.
 */
export async function updateProfilePictureFile(formData: FormData): Promise<UpdatePictureResult> {
  const { userId } = await getAuthenticatedUser();
  try {
    const raw = formData.get("file");
    const file = raw && typeof (raw as Blob).arrayBuffer === "function" && (raw as Blob).size > 0
      ? (raw as File)
      : null;
    if (!file) {
      return { success: false, error: "Aucun fichier valide. Choisissez une image." };
    }
    const result = await uploadProfilePicture(file, userId);
    await db.user.update({
      where: { id: userId },
      data: { profilePicture: result.path, image: result.path },
    });
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, profilePicture: true, image: true, name: true, email: true },
    });
    if (!user) return { success: false, error: "Utilisateur introuvable" };
    return { success: true, user };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur lors de l'upload";
    return { success: false, error: message };
  }
}
