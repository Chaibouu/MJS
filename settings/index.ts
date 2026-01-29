const appConfig = {
  appName: "Ministère de la Jeunesse et des Sports",
  websiteTitle: "MJS Niger - Ministère de la Jeunesse et des Sports",
  websiteDescription:
    "Site officiel du Ministère de la Jeunesse et des Sports du Niger. Découvrez nos programmes, actualités et opportunités pour la jeunesse et le sport.",
  logoUrl: "/armoirie.png",
  sidebarClearlogoUrl: "/armoirie-back.png",
  adminSidebarColor: "#1C2434",
  mailOptions: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASSWORD,
    },
  },
  publicRoutes: [
    "/",
    "/a-propos",
    "/contact",
    "/galerie",
    "/jeunesse",
    "/sports",
    "/opportunites",
  ],
  defaultLoginRedirect: "/dashboard",
  primaryColor: "#035740", 
  pprimaryColor: "#146934", 
  secondaryColor: "#E26E12", 
  primaryDarkColor: "#024a36",
  secondaryDarkColor: "#d45a08",
  primaryLightColor: "#57b58f",
  secondaryLightColor: "#f7bc7a",
  primaryTransparentColor: "#03574020",
  secondaryTransparentColor: "#E26E1220",
  primaryLightTransparentColor: "#03574010",
  secondaryLightTransparentColor: "#E26E1210",

  // Ajout d'une option pour autoriser ou non les connexions multiples
  allowMultipleSessions: false, // ou false pour invalider les anciennes sessions
  rateLimit: {
    windowMs: 10 * 1000, // Durée de la fenêtre en ms (10 seconds)
    max: 5, // Nombre maximum de requêtes par IP dans la fenêtre
  },
  // Configuration du Backoff progressif
  backoff: {
    maxAttempts: 5, // Nombre maximal de tentatives de connexion avant blocage
    backoffDelayFactor: 2, // Facteur de progression du backoff (multiplicateur)
  },
};

export default appConfig;
