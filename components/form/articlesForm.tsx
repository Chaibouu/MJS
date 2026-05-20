"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { articleFormSchema, type ArticleFormData } from "@/schemas/article";
import { createArticle, updateArticle } from "@/actions/articles";
import appConfig from "@/settings";
import { Loader2, X } from "lucide-react";

export type ArticleForForm = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  image: string | null;
  gallery: string[];
  updatedAt?: string | null;
};

export interface ArticlesFormProps {
  onClose: () => void;
  article?: ArticleForForm | null;
  /** "modal" = pas de titre ni bouton submit (header/footer gérés par le parent) */
  layout?: "standalone" | "modal";
  formId?: string;
  /** En layout "modal", notifie le parent pour désactiver/afficher loader sur le bouton Enregistrer */
  onPendingChange?: (pending: boolean) => void;
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

const createDefaults: ArticleFormData = {
  title: "",
  description: "",
  link: "",
  mainImage: undefined,
  gallery: [],
  galleryRemove: [],
};

function defaultsFromArticle(a: ArticleForForm): ArticleFormData {
  return {
    title: a.title,
    description: a.description ?? "",
    link: a.link ?? "",
    mainImage: undefined,
    gallery: [],
    galleryRemove: [],
  };
}

export function ArticlesForm({ onClose, article, layout = "standalone", formId = "articles-form", onPendingChange }: ArticlesFormProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const isEdit = !!article;
  const isModal = layout === "modal";

  const setPending = (v: boolean) => {
    setIsPending(v);
    onPendingChange?.(v);
  };

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: article ? defaultsFromArticle(article) : createDefaults,
  });

  useEffect(() => {
    if (article) form.reset(defaultsFromArticle(article));
    else form.reset(createDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  const galleryRemove = form.watch("galleryRemove") ?? [];
  const existingGallery = (article?.gallery ?? []) as string[];

  const removeFromGallery = (path: string) => {
    form.setValue("galleryRemove", [...galleryRemove, path]);
  };

  const onSubmit = async (data: ArticleFormData) => {
    setPending(true);
    const formData = new FormData();

    if (isEdit && article) {
      formData.append("title", data.title.trim());
      formData.append("description", (data.description ?? "").trim());
      formData.append("link", (data.link ?? "").trim());
      if (data.galleryRemove?.length) {
        formData.append("galleryRemove", JSON.stringify(data.galleryRemove));
      }
      const galleryAdd = data.gallery ?? [];
      for (let i = 0; i < galleryAdd.length; i++) {
        if (galleryAdd[i] instanceof File && galleryAdd[i].size > 0) {
          formData.append("galleryAdd", galleryAdd[i]);
        }
      }
      if (data.mainImage instanceof File && data.mainImage.size > 0) {
        formData.append("mainImage", data.mainImage);
      }

      try {
        const res = await updateArticle(article.id, formData);
        setPending(false);
        toast(res?.message ?? "Article mis à jour avec succès", {
          position: "top-right",
          style: { backgroundColor: appConfig.primaryColor, color: "white" },
        });
        onClose();
        router.refresh();
      } catch (e) {
        setPending(false);
        const msg = e instanceof Error ? e.message : "Erreur lors de la mise à jour";
        toast(`Erreur : ${msg}`, {
          position: "top-right",
          style: { backgroundColor: "#f03e3e", color: "white" },
        });
      }
      return;
    }

    formData.append("title", data.title.trim());
    if ((data.description ?? "").trim()) formData.append("description", (data.description ?? "").trim());
    if ((data.link ?? "").trim()) formData.append("link", (data.link ?? "").trim());
    if (data.mainImage instanceof File && data.mainImage.size > 0) {
      formData.append("mainImage", data.mainImage);
    }
    const gallery = data.gallery ?? [];
    for (let i = 0; i < gallery.length; i++) {
      if (gallery[i] instanceof File && gallery[i].size > 0) {
        formData.append("gallery", gallery[i]);
      }
    }

    try {
      const res = await createArticle(formData);
      setPending(false);
      toast(res?.message ?? "Article créé avec succès", {
        position: "top-right",
        style: { backgroundColor: appConfig.primaryColor, color: "white" },
      });
      onClose();
      router.refresh();
    } catch (e) {
      setPending(false);
      const msg = e instanceof Error ? e.message : "Erreur lors de la création";
      toast(`Erreur : ${msg}`, {
        position: "top-right",
        style: { backgroundColor: "#f03e3e", color: "white" },
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        {!isModal && (
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-500 dark:text-slate-400">
              {isEdit ? "Modifier l'article" : "Ajouter un article"}
            </h1>
          </div>
        )}
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <div className={isModal ? "space-y-6" : "space-y-4"}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isModal ? "text-sm font-medium text-gray-700 dark:text-gray-300" : "mt-2 min-w-[200px] text-lg text-slate-400 dark:text-slate-500"}>
                    Titre <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Veuillez saisir le titre de l'article"
                      disabled={isPending}
                      className={isModal ? "rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isModal ? "text-sm font-medium text-gray-700 dark:text-gray-300" : "mt-2 min-w-[200px] text-lg text-slate-400 dark:text-slate-500"}>
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Description de l'article (optionnel)"
                      disabled={isPending}
                      className={isModal ? "min-h-[100px] rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" : "min-h-[100px] bg-white dark:bg-gray-900"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isModal ? "text-sm font-medium text-gray-700 dark:text-gray-300" : "mt-2 min-w-[200px] text-lg text-slate-400 dark:text-slate-500"}>
                    Lien
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      value={field.value ?? ""}
                      placeholder="https://… (optionnel)"
                      disabled={isPending}
                      className={isModal ? "rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mainImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isModal ? "text-sm font-medium text-gray-700 dark:text-gray-300" : "mt-2 min-w-[200px] text-lg text-slate-400 dark:text-slate-500"}>
                    Image principale
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {isEdit && article?.image && !field.value && (
                        <div className="relative inline-block">
                          <div className="relative h-24 w-40 overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={getImageSrc(article.image, article.updatedAt)}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="160px"
                              unoptimized={String(article.image ?? "").startsWith("/api/")}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Actuelle. Choisir un fichier pour remplacer.
                          </p>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        disabled={isPending}
                        className={isModal ? "rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file ?? null);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && existingGallery.length > 0 && (
              <FormItem>
                <FormLabel className={isModal ? "text-sm font-medium text-gray-700 dark:text-gray-300" : "mt-2 min-w-[200px] text-lg text-slate-400 dark:text-slate-500"}>
                  Galerie actuelle
                </FormLabel>
                <div className="flex flex-wrap gap-2">
                  {existingGallery
                    .filter((p) => !galleryRemove.includes(p))
                    .map((path) => (
                      <div
                        key={path}
                        className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800"
                      >
                        <Image
                          src={getImageSrc(path, article?.updatedAt)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized={String(path).startsWith("/api/")}
                        />
                        <button
                          type="button"
                          onClick={() => removeFromGallery(path)}
                          disabled={isPending}
                          className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                          aria-label="Retirer de la galerie"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cliquez sur × pour retirer une image avant enregistrement.
                </p>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name="gallery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={isModal ? "text-sm font-medium text-gray-700 dark:text-gray-300" : "mt-2 min-w-[200px] text-lg text-slate-400 dark:text-slate-500"}>
                    {isEdit ? "Ajouter des images à la galerie" : "Galerie (images supplémentaires)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isPending}
                      className={isModal ? "rounded-lg border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}
                      onChange={(e) => {
                        const list = e.target.files;
                        const files = list ? Array.from(list) : [];
                        field.onChange(files);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!isModal && (
            <div className="mt-8">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full text-white"
                style={{ backgroundColor: appConfig.secondaryColor }}
              >
                {isPending ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : isEdit ? (
                  "Enregistrer les modifications"
                ) : (
                  "Ajouter l'article"
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
