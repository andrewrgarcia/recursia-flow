"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "es";
interface LangContextProps {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextProps>({
  lang: "en",
  setLang: () => {},
});

// Regions where we want to force Spanish
const SPANISH_REGIONS = new Set([
  "AR","BO","CL","CO","CR","CU","DO","EC","SV","GT","HN","MX",
  "NI","PA","PY","PE","PR","UY","VE","ES" // add Spain explicitly
]);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=(es|en)/)
    if (match) {
      setLangState(match[1] as Lang)
      return
    }

    const url = `${window.location.origin}/api/ip` // absolute path
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const cc = String(data.country_code || "").toUpperCase()
        const detected = SPANISH_REGIONS.has(cc) ? "es" : "en"
        setLangState(detected)
        document.cookie = `lang=${detected}; path=/; max-age=${60 * 60 * 24 * 30}`
      })
      .catch(() => setLangState("en"))
  }, [])


  const setLang = (l: Lang) => {
    document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
