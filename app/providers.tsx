"use client"

import { ReactNode, useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"
import { LanguageProvider, useLang } from "@/context/LanguageContext"

function SyncLang({ children }: { children: ReactNode }) {
  const { lang } = useLang()

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [lang])

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <I18nextProvider i18n={i18n}>
        <SyncLang>{children}</SyncLang>
      </I18nextProvider>
    </LanguageProvider>
  )
}
