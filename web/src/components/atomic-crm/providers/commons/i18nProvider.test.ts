import { afterEach, describe, expect, it, vi } from "vitest";
import { getInitialLocale, i18nProvider } from "./i18nProvider";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("i18nProvider", () => {
  it("registers sl, en and fr locales", () => {
    expect(i18nProvider.getLocales?.()).toEqual([
      { locale: "sl", name: "Slovenščina" },
      { locale: "en", name: "English" },
      { locale: "fr", name: "Français" },
    ]);
  });

  it("translates CRM keys in Slovenian", async () => {
    await i18nProvider.changeLocale("sl");

    expect(i18nProvider.translate("crm.language")).toBe("Jezik");
    expect(
      i18nProvider.translate("resources.contacts.name", { smart_count: 2 }),
    ).toBe("Stranke");
    expect(i18nProvider.translate("ra.auth.sign_in")).toBe("Prijava");
  });

  it("translates the language key in english", async () => {
    await i18nProvider.changeLocale("en");

    expect(i18nProvider.translate("crm.language")).toBe("Language");
  });

  it("falls back to Slovenian catalog for unknown locales", async () => {
    await i18nProvider.changeLocale("es");

    expect(i18nProvider.translate("crm.language")).toBe("Jezik");
  });

  it("uses customized password reset overrides for en and fr", async () => {
    await i18nProvider.changeLocale("en");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Check your emails for a Reset Password message.",
    );

    await i18nProvider.changeLocale("fr");
    expect(i18nProvider.translate("ra-supabase.auth.password_reset")).toBe(
      "Consultez vos emails pour trouver le message de reinitialisation du mot de passe.",
    );
  });

  it("translates recently added fr crm keys", async () => {
    await i18nProvider.changeLocale("fr");

    expect(i18nProvider.translate("resources.deals.empty.title")).toBe(
      "Aucune affaire trouvée",
    );
  });

  it("uses browser Slovenian locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "sl-SI",
      languages: ["sl-SI", "en-US"],
    });

    expect(getInitialLocale()).toBe("sl");
  });

  it("uses browser english locale when available", () => {
    vi.stubGlobal("navigator", {
      language: "en-US",
      languages: ["en-US"],
    });

    expect(getInitialLocale()).toBe("en");
  });

  it("defaults to Slovenian when browser locale is unsupported", () => {
    vi.stubGlobal("navigator", {
      language: "es-ES",
      languages: ["es-ES", "pt-BR"],
    });

    expect(getInitialLocale()).toBe("sl");
  });
});
