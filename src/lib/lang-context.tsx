"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "fr" | "en" | "pt";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "fr",
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("rumios-lang") as Lang | null;
    if (saved && (["fr", "en", "pt"] as Lang[]).includes(saved)) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("rumios-lang", l);
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
