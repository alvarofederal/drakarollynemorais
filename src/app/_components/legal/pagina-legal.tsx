import type { ReactNode } from "react"
import { SiteHeader } from "@/app/_components/landing/site-header"
import { SiteFooter } from "@/app/_components/landing/site-footer"

/**
 * Moldura das páginas legais.
 *
 * O conteúdo real precisa ser redigido por quem responde juridicamente pela
 * plataforma — não inventamos texto de política de privacidade nem de termos
 * de uso. Estas páginas existem para que os links do rodapé e do cadastro não
 * caiam em 404 antes disso.
 */
export function PaginaLegal({
  titulo,
  children,
}: {
  titulo: string
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <SiteHeader />
      <main className="mx-auto w-full px-5 py-14 sm:px-8 sm:py-20">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-km-ink sm:text-4xl">
          {titulo}
        </h1>
        <div className="flex max-w-3xl flex-col gap-4 pt-6 leading-relaxed text-km-ink-soft">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
