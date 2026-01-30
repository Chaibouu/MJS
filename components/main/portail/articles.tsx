"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getArticleById, deleteArticle } from "@/actions/articles";
import { toast } from "sonner";
import appConfig from "@/settings";

export type ArticleListItem = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  image: string | null;
  gallery: unknown;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  updatedByUser?: {
    id: string;
    name: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

export type ArticleDetail = ArticleListItem;
import {
  Search,
  FileText,
  Calendar,
  User,
  MoreHorizontal,
  Eye,
  Trash2,
  ExternalLink,
  Loader2,
  Plus,
  Pencil,
} from "lucide-react";
import { ArticlesForm, type ArticleForForm } from "@/components/form/articlesForm";

function displayAuthor(u: ArticleListItem["createdByUser"]): string {
  if (!u) return "—";
  const parts = [u.firstName, u.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ").trim();
  return u.name ?? u.email ?? "—";
}

function getImageSrc(path: string | null | undefined, updatedAt?: string | null): string {
  if (!path) return "/armoirie.png";
  const ts = updatedAt ? new Date(updatedAt).getTime() : null;
  const qs = path.startsWith("/api/uploads/") && ts != null ? `?t=${ts}` : "";
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (path.startsWith("/api/") && base) {
    return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}${qs}`;
  }
  return `${path}${qs}`;
}

export type ArticlesProps = {
  articles: ArticleListItem[];
};

export function Articles({ articles: initialArticles }: ArticlesProps) {
  const [search, setSearch] = useState("");
  const [viewArticle, setViewArticle] = useState<ArticleListItem | null>(null);
  const [viewFull, setViewFull] = useState<ArticleDetail | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleListItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<ArticleForForm | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormPending, setEditFormPending] = useState(false);
  const [addFormPending, setAddFormPending] = useState(false);
  const [viewDisplayedImage, setViewDisplayedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!viewFull) {
      setViewDisplayedImage(null);
      return;
    }
    const gallery = Array.isArray(viewFull.gallery) ? (viewFull.gallery as string[]) : [];
    const main = viewFull.image ?? gallery[0] ?? null;
    setViewDisplayedImage(main);
  }, [viewFull?.id, viewFull?.image, viewFull?.gallery]);

  const filtered = useMemo(() => {
    if (!search.trim()) return initialArticles;
    const q = search.trim().toLowerCase();
    return initialArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
    );
  }, [initialArticles, search]);

  const fetchDetail = async (id: string) => {
    setViewLoading(true);
    setViewError(null);
    try {
      const data = await getArticleById(id);
      setViewFull(JSON.parse(JSON.stringify(data)) as ArticleDetail);
    } catch (e) {
      setViewError(e instanceof Error ? e.message : "Erreur lors du chargement");
    } finally {
      setViewLoading(false);
    }
  };

  const openView = (a: ArticleListItem) => {
    setViewArticle(a);
    setViewFull(null);
    fetchDetail(a.id);
  };

  const openEdit = async (id: string) => {
    setEditLoading(true);
    try {
      const d = await getArticleById(id);
      const data = JSON.parse(JSON.stringify(d)) as Record<string, unknown>;
      const gallery = Array.isArray(data.gallery) ? (data.gallery as string[]) : [];
      const adapted: ArticleForForm = {
        id: String(data.id),
        title: String(data.title ?? ""),
        description: data.description != null ? String(data.description) : null,
        link: data.link != null ? String(data.link) : null,
        image: data.image != null ? String(data.image) : null,
        gallery,
        updatedAt: data.updatedAt != null ? String(data.updatedAt) : null,
      };
      setEditArticle(adapted);
      setEditFormOpen(true);
    } catch (e) {
      setEditArticle(null);
      setEditFormOpen(false);
      toast(`Erreur : ${e instanceof Error ? e.message : "Impossible de charger l'article"}`, {
        position: "top-right",
        style: { backgroundColor: "#f03e3e", color: "white" },
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteArticle(deleteTarget.id);
      setDeleteTarget(null);
      window.location.reload();
    } catch {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Articles
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {initialArticles.length} article{initialArticles.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Button
          onClick={() => setAddFormOpen(true)}
          className="inline-flex items-center gap-2 bg-primaryColor text-white hover:bg-primaryDarkColor dark:bg-primaryDarkColor dark:hover:bg-primaryColor"
        >
          <Plus className="h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      {/* Barre recherche */}
      <div className="rounded-2xl bg-gradient-to-r from-primaryColor to-primaryDarkColor px-4 py-4 sm:px-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/80" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou description…"
            className="border-0 bg-white/95 pl-10 text-gray-900 placeholder:text-gray-500 dark:bg-gray-900/95 dark:text-gray-100 dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="rounded-full bg-primaryLightTransparentColor p-4">
              <FileText className="h-10 w-10 text-primaryColor" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Aucun article trouvé
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {search.trim()
                  ? "Essayez un autre terme de recherche."
                  : "Les articles apparaîtront ici une fois créés."}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card
              key={a.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-sm transition-all hover:border-primaryColor/30 hover:shadow-lg dark:border-gray-800 dark:hover:border-primaryColor/40"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={getImageSrc(a.image, a.updatedAt)}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={String(a.image ?? "").startsWith("/api/")}
                />
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/90 shadow hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openView(a)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openEdit(a.id)}
                        disabled={editLoading}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 dark:text-red-400"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardHeader className="flex-1 pb-2">
                <CardTitle className="line-clamp-2 text-lg leading-tight">
                  {a.title}
                </CardTitle>
                {a.description && (
                  <CardDescription className="line-clamp-2 text-sm">
                    {a.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardFooter className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                {a.createdByUser && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <User className="h-3.5 w-3.5" />
                    {displayAuthor(a.createdByUser)}
                  </span>
                )}
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primaryColor hover:bg-primaryColor/10 hover:text-primaryDarkColor dark:text-primaryLightColor dark:hover:bg-primaryColor/20"
                    onClick={() => openView(a)}
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    Voir
                  </Button>
                  {a.link && (
                    <Link href={a.link} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Voir */}
      <Dialog
        open={!!viewArticle}
        onOpenChange={(open) => {
          if (!open) {
            setViewArticle(null);
            setViewFull(null);
            setViewError(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl sm:rounded-2xl">
          <div className="flex-shrink-0 rounded-t-2xl bg-gradient-to-r from-primaryColor to-primaryDarkColor px-6 py-5 pr-14">
            <DialogTitle className="text-lg font-semibold text-white">
              Détails de l&apos;article
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-white/85">
              {viewArticle?.title}
            </DialogDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {viewLoading && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primaryColor" />
                <p className="text-sm text-gray-500">Chargement…</p>
              </div>
            )}
            {viewError && (
              <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {viewError}
              </div>
            )}
            {viewFull && !viewLoading && (
              <div className="space-y-6 px-6 py-6">
                <div className="space-y-3">
                  {viewDisplayedImage && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={getImageSrc(viewDisplayedImage, viewFull.updatedAt)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 672px"
                        unoptimized={String(viewDisplayedImage).startsWith("/api/")}
                      />
                    </div>
                  )}
                  {!viewDisplayedImage && (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                      Aucune image
                    </div>
                  )}
                  {(() => {
                    const gallery = Array.isArray(viewFull.gallery) ? (viewFull.gallery as string[]) : [];
                    const allPaths = [...new Set((viewFull.image ? [viewFull.image, ...gallery] : gallery).filter(Boolean) as string[])];
                    if (allPaths.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-2">
                        {allPaths.map((path) => (
                          <button
                            key={path}
                            type="button"
                            onClick={() => setViewDisplayedImage(path)}
                            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 transition-all hover:opacity-90 dark:bg-gray-800 ${
                              viewDisplayedImage === path
                                ? "border-primaryColor ring-2 ring-primaryColor ring-offset-2 dark:ring-offset-gray-900"
                                : "border-transparent"
                            }`}
                          >
                            <Image
                              src={getImageSrc(path, viewFull.updatedAt)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="56px"
                              unoptimized={String(path).startsWith("/api/")}
                            />
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {viewFull.title}
                  </h3>
                  {viewFull.description && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                      {viewFull.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {viewFull.createdAt
                      ? new Date(viewFull.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  {viewFull.createdByUser && (
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {displayAuthor(viewFull.createdByUser)}
                    </span>
                  )}
                </div>
                {viewFull.link && (
                  <Link
                    href={viewFull.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primaryColor hover:underline dark:text-primaryLightColor"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lien externe
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setViewArticle(null);
                  setViewFull(null);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;article</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer «&nbsp;{deleteTarget?.title}&nbsp;» ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression…
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajouter un article */}
      <Dialog
        open={addFormOpen}
        onOpenChange={(open) => {
          setAddFormOpen(open);
          if (!open) setAddFormPending(false);
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl sm:rounded-2xl">
          <div className="flex-shrink-0 rounded-t-2xl bg-gradient-to-r from-primaryColor to-primaryDarkColor px-6 py-5 pr-14">
            <DialogTitle className="text-lg font-semibold text-white">
              Ajouter un article
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-white/85">
              Remplissez les champs puis enregistrez.
            </DialogDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
            <ArticlesForm
              layout="modal"
              formId="add-article-form"
              onClose={() => setAddFormOpen(false)}
              onPendingChange={setAddFormPending}
            />
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAddFormOpen(false)} disabled={addFormPending}>
                Annuler
              </Button>
              <Button
                type="submit"
                form="add-article-form"
                disabled={addFormPending}
                style={{ backgroundColor: appConfig.secondaryColor }}
                className="text-white hover:opacity-90"
              >
                {addFormPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi…
                  </>
                ) : (
                  "Ajouter l'article"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Modifier un article */}
      <Dialog
        open={editFormOpen}
        onOpenChange={(open) => {
          setEditFormOpen(open);
          if (!open) {
            setEditArticle(null);
            setEditFormPending(false);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl sm:rounded-2xl">
          <div className="flex-shrink-0 rounded-t-2xl bg-gradient-to-r from-primaryColor to-primaryDarkColor px-6 py-5 pr-14">
            <DialogTitle className="text-lg font-semibold text-white">
              Modifier l&apos;article
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-white/85">
              {editArticle?.title ?? "—"}
            </DialogDescription>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-6">
            {editArticle && (
              <ArticlesForm
                article={editArticle}
                layout="modal"
                formId="edit-article-form"
                onClose={() => {
                  setEditFormOpen(false);
                  setEditArticle(null);
                }}
                onPendingChange={setEditFormPending}
              />
            )}
          </div>
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setEditFormOpen(false);
                  setEditArticle(null);
                }}
                disabled={editFormPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                form="edit-article-form"
                disabled={editFormPending}
                style={{ backgroundColor: appConfig.secondaryColor }}
                className="text-white hover:opacity-90"
              >
                {editFormPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement…
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
