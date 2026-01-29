"use server";

import { makeAuthenticatedRequest } from "./makeAuthenticatedRequest";

const BASE = `${process.env.NEXT_PUBLIC_APP_URL}/api/articles`;

async function handleResponse<T>(res: unknown, errMessage: string): Promise<T> {
  if (res && typeof res === "object" && "error" in res) {
    throw new Error((res as { error: string }).error);
  }
  if (res instanceof Response) {
    const d = await res.json();
    throw new Error((d as { error?: string }).error ?? "Erreur serveur");
  }
  return JSON.parse(JSON.stringify(res)) as T;
}

export async function getArticles() {
  try {
    const res = await makeAuthenticatedRequest(`${BASE}`, "GET");
    const data = await handleResponse<unknown>(res, "Échec de la récupération des articles");
    const list = Array.isArray(data) ? data : [];
    return list;
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : "Échec de la récupération des articles"
    );
  }
}

export async function getArticleById(id: string) {
  try {
    const res = await makeAuthenticatedRequest(
      `${BASE}/${encodeURIComponent(id)}`,
      "GET"
    );
    return handleResponse(res, "Échec de la récupération de l'article");
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : "Échec de la récupération de l'article"
    );
  }
}

export async function deleteArticle(id: string) {
  try {
    const res = await makeAuthenticatedRequest(
      `${BASE}/${encodeURIComponent(id)}`,
      "DELETE"
    );
    return handleResponse(res, "Échec de la suppression de l'article");
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : "Échec de la suppression de l'article"
    );
  }
}
