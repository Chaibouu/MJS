import React from "react";
import { getArticles } from "@/actions/articles";
import { Articles, type ArticleListItem } from "@/components/main/portail/articles";

export default async function ArticlesPage() {
  try {
    const articles = (await getArticles()) as ArticleListItem[];
    return (
      <div className="space-y-6">
        <Articles articles={articles} />
      </div>
    );
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Erreur lors du chargement des articles";
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        <p className="font-medium">Impossible de charger les articles</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
    );
  }
}
