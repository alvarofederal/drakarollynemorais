"use client"

import Link from "next/link"
import Image from "next/image"
import { Check, Lock, Play } from "lucide-react"
import { formatarDuracao } from "@/lib/formato"
import { cn } from "@/lib/utils"

export type AulaDoCard = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  capaUrl: string | null
  tipo: "VIDEO" | "TEXTO" | "PDF"
  gratuita: boolean
  duracaoSegundos: number | null
  liberada: boolean
  concluida: boolean
}

/**
 * Card em pé de uma aula, no formato de pôster.
 *
 * Liberado, é um link para a sala de aula. Bloqueado, é um botão que abre o
 * painel de compra — nunca um link morto.
 */
export function CardAula({
  aula,
  cursoSlug,
  indice,
  aoClicarBloqueada,
}: {
  aula: AulaDoCard
  cursoSlug: string
  indice: number
  aoClicarBloqueada: () => void
}) {
  const numero = String(indice + 1).padStart(2, "0")

  const miolo = (
    <>
      {/* capa */}
      {aula.capaUrl ? (
        <Image
          src={aula.capaUrl}
          alt=""
          fill
          sizes="200px"
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-105",
            !aula.liberada && "opacity-40 grayscale"
          )}
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-km-brand-soft to-km-sunk",
            !aula.liberada && "opacity-50"
          )}
        />
      )}

      {/* véu para o texto ficar legível sobre qualquer imagem */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10"
      />

      {/* selo de canto */}
      <span className="absolute top-2.5 left-2.5 z-10">
        {!aula.liberada ? (
          <span className="grid size-7 place-items-center rounded-full bg-black/75 text-white/90 backdrop-blur">
            <Lock className="size-3.5" />
          </span>
        ) : aula.concluida ? (
          <span className="grid size-7 place-items-center rounded-full bg-km-brand text-km-on-brand">
            <Check className="size-4" />
          </span>
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-white/15 text-white backdrop-blur">
            <Play className="size-3.5 translate-x-px fill-current" />
          </span>
        )}
      </span>

      {aula.gratuita && !aula.concluida && (
        <span className="absolute top-3 right-2.5 z-10 rounded-sm bg-km-brand px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider text-km-on-brand uppercase">
          grátis
        </span>
      )}

      {/* texto */}
      <span className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-0.5 p-3">
        <span className="line-clamp-2 text-sm leading-tight font-medium text-white">
          {aula.titulo}
        </span>
        <span className="flex items-center gap-2 font-mono text-[10px] text-white/55">
          <span>AULA {numero}</span>
          {aula.duracaoSegundos ? (
            <span>· {formatarDuracao(Math.round(aula.duracaoSegundos / 60))}</span>
          ) : null}
        </span>
      </span>

      {/* canto em diagonal — acento da marca */}
      <span
        aria-hidden
        className={cn(
          "absolute right-0 bottom-0 z-10 size-0 border-t-[18px] border-r-[18px] border-t-transparent",
          aula.liberada ? "border-r-km-brand" : "border-r-white/20"
        )}
      />
    </>
  )

  const classes = cn(
    "group relative block aspect-[2/3] w-[9.5rem] shrink-0 overflow-hidden rounded-lg border transition-all sm:w-[11rem]",
    aula.liberada
      ? "border-km-line hover:border-km-brand focus-visible:border-km-brand"
      : "cursor-pointer border-km-line-soft"
  )

  // O balão nativo do navegador: funciona no toque, no teclado e no leitor de tela
  const balao = aula.descricao ?? undefined

  if (!aula.liberada) {
    return (
      <button
        type="button"
        onClick={aoClicarBloqueada}
        className={classes}
        title={balao}
        aria-label={`Aula ${numero}: ${aula.titulo}. Bloqueada — clique para liberar o acesso.`}
      >
        {miolo}
      </button>
    )
  }

  return (
    <Link
      href={`/aluno/curso/${cursoSlug}/${aula.slug}`}
      className={classes}
      title={balao}
      aria-label={`Aula ${numero}: ${aula.titulo}${aula.concluida ? " (concluída)" : ""}`}
    >
      {miolo}
    </Link>
  )
}
