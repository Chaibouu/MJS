import React from "react";
import { Utilisateurs, type UserListItem } from "@/components/main/utilisateurs";
import { getUsers } from "@/actions/users";

type PageProps = {
  searchParams: Promise<{ page?: string; search?: string }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params?.page ?? "1", 10) || 1);
  const search = typeof params?.search === "string" ? params.search : undefined;

  try {
    const data = await getUsers({ page, limit: 20, search });
    return (
      <Utilisateurs
        users={(data.users ?? []) as UserListItem[]}
        total={data.total ?? 0}
        page={data.page ?? 1}
        limit={data.limit ?? 20}
        totalPages={data.totalPages ?? 1}
        search={search ?? ""}
      />
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur lors du chargement des utilisateurs";
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        <p className="font-medium">Impossible de charger les utilisateurs</p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
    );
  }
}
