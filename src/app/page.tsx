import type { Metadata } from "next"
import { SiteHeader } from "./_components/landing/site-header"
import { Hero } from "./_components/landing/hero"
import {
  Catalogo,
  ComoFunciona,
  CtaFinal,
  Depoimentos,
  Numeros,
  OQueRecebe,
  Pagamento,
  Sobre,
} from "./_components/landing/sections"
import { Faq } from "./_components/landing/faq"
import { SiteFooter } from "./_components/landing/site-footer"
import { hero, marca } from "@/config/landing"

/**
 * A landing lê o catálogo do banco. Sem isto ela seria gerada no build e o
 * curso publicado só apareceria no próximo deploy.
 * Publicar/despublicar também chama revalidatePath("/") — isto aqui é a rede
 * de segurança para qualquer outra mudança.
 */
export const revalidate = 300

export const metadata: Metadata = {
  title: "Cursos para médicos e residentes",
  description: hero.subtitulo,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${marca.nome} — ${hero.titulo}`,
    description: hero.subtitulo,
    url: "/",
    type: "website",
  },
}

export default function Home() {
  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <SiteHeader />
      <main>
        <Hero />
        <Numeros />
        <ComoFunciona />
        <OQueRecebe />
        <Catalogo />
        <Sobre />
        <Depoimentos />
        <Pagamento />
        <Faq />
        <CtaFinal />
      </main>
      <SiteFooter />
    </div>
  )
}
