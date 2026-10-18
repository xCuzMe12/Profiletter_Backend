import { mergeTranslations } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import frenchMessages from "ra-language-french";
import { raSupabaseEnglishMessages } from "ra-supabase-language-english";
import { raSupabaseFrenchMessages } from "ra-supabase-language-french";
import { englishCrmMessages } from "./englishCrmMessages";
import { frenchCrmMessages } from "./frenchCrmMessages";
import { slovenianCrmMessages } from "./slovenianCrmMessages";
import { slovenianRaMessages } from "./slovenianRaMessages";

const raSupabaseEnglishMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset: "Check your emails for a Reset Password message.",
    },
    oauth: {
      authorize: "Authorize Application",
      authorize_details: "This application wants to access your account.",
      access_scope:
        "It will be able to read and modify your data, with the same permissions as your account.",
      approved: "Authorization Approved",
      close_tab: "You can now close this tab.",
      no_request: "No authorization request found",
    },
  },
};

const raSupabaseFrenchMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset:
        "Consultez vos emails pour trouver le message de reinitialisation du mot de passe.",
    },
    oauth: {
      authorize: "Autoriser l'application",
      authorize_details: "Cette application souhaite accéder à votre compte.",
      access_scope:
        "Elle pourra lire et modifier vos données, avec les mêmes droits que votre compte.",
      approved: "Autorisation accordée",
      close_tab: "Vous pouvez fermer cet onglet.",
      no_request: "Aucune demande d'autorisation trouvée",
    },
  },
};

const raSupabaseSlovenianMessagesOverride = {
  "ra-supabase": {
    auth: {
      password_reset:
        "Preverite e-pošto — poslali smo vam sporočilo za ponastavitev gesla.",
    },
    oauth: {
      authorize: "Pooblasti aplikacijo",
      authorize_details: "Ta aplikacija želi dostopati do vašega računa.",
      access_scope:
        "Lahko bo brala in spreminjala vaše podatke z enakimi dovoljenji kot vaš račun.",
      approved: "Pooblastilo odobreno",
      close_tab: "Zdaj lahko zaprete ta zavihek.",
      no_request: "Zahteva za pooblastilo ni najdena",
    },
  },
};

const englishCatalog = mergeTranslations(
  englishMessages,
  raSupabaseEnglishMessages,
  raSupabaseEnglishMessagesOverride,
  englishCrmMessages,
);

const frenchCatalog = mergeTranslations(
  englishCatalog,
  frenchMessages,
  raSupabaseFrenchMessages,
  raSupabaseFrenchMessagesOverride,
  frenchCrmMessages,
);

const slovenianCatalog = mergeTranslations(
  englishCatalog,
  slovenianRaMessages,
  raSupabaseSlovenianMessagesOverride,
  slovenianCrmMessages,
);

export type AppLocale = "sl" | "en" | "fr";

export const getInitialLocale = (): AppLocale => {
  if (typeof navigator === "undefined") {
    return "sl";
  }

  const browserLocale = (
    navigator.languages?.[0] ??
    navigator.language ??
    ""
  ).toLowerCase();

  if (browserLocale.startsWith("sl")) return "sl";
  if (browserLocale.startsWith("en")) return "en";
  if (browserLocale.startsWith("fr")) return "fr";

  // Profiletter default
  return "sl";
};

export const i18nProvider = polyglotI18nProvider(
  (locale) => {
    if (locale === "fr") return frenchCatalog;
    if (locale === "en") return englishCatalog;
    return slovenianCatalog;
  },
  getInitialLocale(),
  [
    { locale: "sl", name: "Slovenščina" },
    { locale: "en", name: "English" },
    { locale: "fr", name: "Français" },
  ],
  { allowMissing: true },
);

export const testI18nProvider = polyglotI18nProvider(
  () => slovenianCatalog,
  "sl",
  [
    { locale: "sl", name: "Slovenščina" },
    { locale: "en", name: "English" },
  ],
  { allowMissing: true },
);
