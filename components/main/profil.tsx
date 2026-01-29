"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EditProfilPicture } from "./editProfilPicture";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { revalidateProfil } from "@/actions/updateProfilePicture";
import { User } from "@prisma/client";
import { roleLabels, sexeLabels } from "@/settings/labels";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  Languages,
} from "lucide-react";

const getProfileImageSrc = (
  path: string | null | undefined,
  updatedAt?: string | Date | null
): string => {
  if (!path) return "/avatar/default-avatar.jpg";
  const ts =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : typeof updatedAt === "string"
        ? new Date(updatedAt).getTime()
        : null;
  const qs = path.startsWith("/api/uploads/") && ts != null ? `?t=${ts}` : "";
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (path.startsWith("/api/") && base) {
    return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}${qs}`;
  }
  return `${path}${qs}`;
};

export const Profil = ({ user }: { user: User | null }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "infos">("details");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [profileImgError, setProfileImgError] = useState(false);

  useEffect(() => {
    setProfileImgError(false);
  }, [user?.id, user?.profilePicture, user?.image, user?.updatedAt]);

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setShowResetPasswordModal(false);
    await revalidateProfil();
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center p-8 text-gray-500">
        Connectez-vous pour accéder à votre profil.
      </div>
    );
  }

  return (
   
    <div className="h-full flex flex-col bg-gray-50">
    {/* Header avec gradient primaryColor - arrondi en bas */}
    <div className="bg-gradient-to-r from-primaryColor to-primaryDarkColor flex-shrink-0 rounded-t-3xl">
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
        <p className="mt-2 text-green-100">Gérez vos informations personnelles</p>
      </div>
    </div>

    {/* Header avec image de fond et photo de profil */}
    <div className="relative flex-shrink-0">
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${user.headerPicture || "/niamey.jpg"})`,
        }}
      >
        {/* Overlay avec couleur principale du projet et forte opacité */}
        <div className="absolute inset-0 bg-[#16a34a]/20"></div>

        {/* Contenu du header */}
        <div className="relative h-full max-w-4xl px-8 flex items-end pb-8">
          <div className="flex items-center space-x-6 w-full">
            {/* Photo de profil */}
            <div className="relative">
              <div className="relative h-32 w-32">
                <img
                  className="h-32 w-32 rounded-full object-cover ring-6 ring-white bg-white shadow-2xl"
                  src={
                    profileImgError
                      ? "/avatar/default-avatar.jpg"
                      : getProfileImageSrc(
                          (user.profilePicture ?? user.image) as string,
                          user.updatedAt
                        )
                  }
                  alt={user.name || "Utilisateur"}
                  onError={() => setProfileImgError(true)}
                />
              </div>
              {/* Bouton modifier photo en overlay */}
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 rounded-full bg-primaryColor p-2 text-white shadow-lg ring-4 ring-white transition-all hover:scale-110 hover:bg-primaryDarkColor"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-bold">
                {user.name || 'Nom non défini'}
              </h2>
              <p className="text-xl text-white/90 mt-1">
                {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                  user.name ||
                  "—"}
              </p>
              <p className="text-base text-white/80 mt-2">{user.email}</p>
              <div className="mt-4 flex items-center space-x-3 flex-wrap gap-y-2">
                <span className="inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  {roleLabels[user.role] ?? user.role}
                </span>
                <span className={`inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full backdrop-blur-sm border ${
                  user.isActive
                    ? 'bg-green-500/20 text-white border-green-300/50'
                    : 'bg-red-500/20 text-white border-red-300/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    user.isActive ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  {user.isActive ? 'Compte actif' : 'Compte inactif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Contenu scrollable */}
    {/* <div className="flex-1 overflow-y-auto modal-scroll p-8"> */}
    <div className="flex-1 overflow-y-auto modal-scroll">
      {/* <div className="max-w-4xl mx-auto"> */}
        {/* Onglets au niveau du grand conteneur */}
        <div className="w-full bg-white rounded-b-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`${activeTab === 'details' ? 'text-primaryColor border-primaryColor' : 'text-gray-600 border-transparent'} border-b-2 px-3 py-2 text-sm font-semibold`}
            >
              Détails du compte
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('infos')}
              className={`${activeTab === 'infos' ? 'text-primaryColor border-primaryColor' : 'text-gray-600 border-transparent'} border-b-2 px-3 py-2 text-sm font-semibold`}
            >
              Informations personnelles
            </button>
          </div>
        </div>
          {/* Contenu de l'onglet actif */}
        {activeTab === "details" && (
          <div className="p-6 sm:p-8">
            <div className="space-y-8">
              {/* Identité */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primaryColor">
                  <UserIcon className="h-4 w-4" />
                  Identité
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { icon: UserIcon, label: "Prénom", value: user.firstName ?? "—" },
                    { icon: UserIcon, label: "Nom", value: user.lastName ?? "—" },
                    {
                      icon: UserIcon,
                      label: "Sexe",
                      value: user.sexe ? (sexeLabels[user.sexe] ?? user.sexe) : "—",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-primaryColor/30 hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
                        <p className="mt-0.5 truncate text-base font-medium text-gray-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primaryColor">
                  <Mail className="h-4 w-4" />
                  Contact
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Mail, label: "Email", value: user.email ?? "—" },
                    { icon: Phone, label: "Téléphone", value: user.phone ?? "—" },
                    { icon: MapPin, label: "Adresse", value: user.address ?? "—" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-primaryColor/30 hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
                        <p className="mt-0.5 break-words text-base font-medium text-gray-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Biographie & Langues */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primaryColor">
                  <FileText className="h-4 w-4" />
                  À propos
                </h3>
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-primaryColor/30 hover:bg-gray-50 lg:col-span-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Biographie</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-base font-medium leading-relaxed text-gray-900">
                        {user.bio ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-primaryColor/30 hover:bg-gray-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                      <Languages className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Langues</p>
                      <p className="mt-0.5 text-base font-medium text-gray-900">
                        {Array.isArray(user.nigerLanguage) && user.nigerLanguage.length > 0
                          ? user.nigerLanguage.join(", ")
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Compte */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primaryColor">
                  <ShieldCheck className="h-4 w-4" />
                  Compte
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      icon: ShieldCheck,
                      label: "Rôle",
                      value: roleLabels[user.role] ?? user.role,
                    },
                    {
                      icon: Calendar,
                      label: "Date de création",
                      value: user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—",
                    },
                    {
                      icon: Clock,
                      label: "Dernière mise à jour",
                      value: user.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—",
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-start gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-primaryColor/30 hover:bg-gray-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primaryColor/10 text-primaryColor">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
                        <p className="mt-0.5 break-words text-base font-medium text-gray-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "infos" && (
          <div className="p-8">
            <form
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={user.phone ?? ""}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-primaryColor focus:outline-none focus:ring-2 focus:ring-primaryColor"
                  placeholder="Ex: +227 90 00 00 00"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Adresse</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={user.address ?? ""}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-primaryColor focus:outline-none focus:ring-2 focus:ring-primaryColor"
                  placeholder="Ex: Niamey, Niger"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Biographie</label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={user.bio ?? ""}
                  className="min-h-28 w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-primaryColor focus:outline-none focus:ring-2 focus:ring-primaryColor"
                  placeholder="Quelques mots sur vous..."
                />
              </div>
              <div className="flex justify-end md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-xl bg-primaryColor px-6 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-primaryDarkColor"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}
        </div>
      {/* </div> */}
    </div>

    {/* Modaux */}
    <>
      <EditProfilPicture
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        user={user}
      />
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        onSuccess={handleEditSuccess}
        user={user}
      />
    </>
  </div>
  );
};
