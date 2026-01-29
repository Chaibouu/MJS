export interface ChildrenItem {
  title: string;
  path: string;
  allowedRoles: string[];
}
export interface NavigationItem {
  title: string;
  icon: string;
  path: string;
  children?: ChildrenItem[];
  allowedRoles: string[];
}

export interface MenuChildItem {
  title: string;
  href: string;
  description?: string;
  icon?: string; // Nom de l'icône de lucide-react (optionnel)
}

export interface MenuItem {
  href: string;
  label: string;
  children?: MenuChildItem[];
}

export const adminNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: "material-symbols:dashboard",
    path: "/dashboard",
    allowedRoles: ["ADMIN", "USER"],
  },
  {
    title: "Associations",
    icon: "material-symbols:home-work",
    path: "/association",
    allowedRoles: ["ADMIN", "ASSOCIATION"],
  },
  {
    title: "Profile",
    icon: "solar:user-bold-duotone",
    path: "/profil",
    allowedRoles: ["ADMIN", "USER"],
  },
  {
    title: "Utilisateurs",
    icon: "solar:users-group-two-rounded-bold-duotone",
    path: "/users",
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Portail Web",
    // icon: "eos-icons:admin",
    icon: "solar:shield-network-broken",
    path: "/portail",
    children: [
      {
        title: "Articles",
        path: "/portail/articles",
        allowedRoles: ["ADMIN","USER"],
      },
      {
        title: "Actualités",
        path: "/portail/actualites",
        allowedRoles: ["ADMIN"],
      },
      {
        title: "Projets",
        path: "/portail/projets",
        allowedRoles: ["ADMIN"],
      },
      {
        title: "Médias",
        path: "/portail/medias",
        allowedRoles: ["ADMIN"],
      },
    ],
    allowedRoles: ["ADMIN"],
  },
  {
    title: "Paramètres",
    icon: "material-symbols:settings",
    path: "/dashboard/settings",
    allowedRoles: ["ADMIN"],
  },
];



export const menuItems: MenuItem[] = [
  { href: "/", label: "Accueil" },
  { 
    href: "/ministere", 
    label: "Ministère",
    children: [
      {
        title: "Message du Ministre",
        href: "/ministere/message",
        description: "Discours et messages du ministre",
        icon: "MessageSquare"
      },
      {
        title: "Mission et Attributions",
        href: "/ministere/mission",
        description: "Les missions et attributions du ministère",
        icon: "Target"
      },
      {
        title: "Organisation du Ministère",
        href: "/ministere/organisation",
        description: "Structure organisationnelle",
        icon: "Building2"
      },
      {
        title: "Services Rattachés",
        href: "/ministere/services",
        description: "Les services rattachés au ministère",
        icon: "Briefcase"
      },
      {
        title: "Projets et Programmes",
        href: "/ministere/projets",
        description: "Projets et programmes en cours",
        icon: "FolderKanban"
      }
    ]
  },
  { href: "/jeunesse", label: "Jeunesse" },
  { href: "/sports", label: "Sports" },
  { href: "/partenaire", label: "Partenaires" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];
