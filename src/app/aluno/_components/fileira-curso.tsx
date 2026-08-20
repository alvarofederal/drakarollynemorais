"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Lock, PlayCircle } from "lucide-react"
import { formatarData, formatarDuracao, formatarPreco } from "@/lib/formato"
import { cn } from "@/lib/utils"
import { CardAula, type AulaDoCard } from "./card-aula"
import { PainelDeAcesso } from "./painel-de-acesso"

export type CursoDaFileira = {
  id: string
  slug: string
  titulo: string
  subtitulo: string | null
  capaUrl: string | null
  cargaHorariaMinutos: number
  precoCentavos: number
  acessoDias: number | null
}

/**
 * Uma fileira por curso: capa em faixa, dados, e os cards de aula rolando na
 * horizontal. É o card "de fora a fora" com as caixinhas dentro.
 */
export function FileiraCurso({
  curso,
  aulas,
  temAcesso,
  motivo,
  percentual,
  expiraEm,
  precoComunidadeCentavos,
}: {
  curso: CursoDaFileira
  aulas: AulaDoCard[]
  temAcesso: boolean
  motivo: string
  percentual: number
  expiraEm: Date | null
  precoComunidadeCentavos: number | null
}) {
  const fita = useRef<HTMLDivElement>(null)
  const [painelAberto, setPainelAberto] = useState(false)

  function rolar(direcao: -1 | 1) {
    const el = fita.current
    if (!el) return
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: "smooth" })
  }

  const liberadas = aulas.filter((a) => a.liberada).length
  const proxima = aulas.find((a) => a.liberada && !a.concluida) ?? aulas.find((a) => a.liberada)

  return (
    <section className="flex flex-col gap-3">
      {/* faixa de cabeçalho com a capa do curso ao fundo */}
      <div className="relative overflow-hidden rounded-xl border border-km-line bg-km-surface">
        {curso.capaUrl && (
          <Image
            src={curso.capaUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
            priority={false}
          />
        )}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            curso.capaUrl
              ? "bg-gradient-to-r from-km-surface via-km-surface/90 to-km-surface/40"
              : "bg-gradient-to-r from-km-brand-soft/50 to-transparent"
          )}
        />

        <div className="relative flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.14em] text-km-brand lowercase">
              /{curso.slug}
            </span>
            <h2 className="font-display text-2xl leading-tight font-semibold text-km-ink sm:text-3xl">
              {curso.titulo}
            </h2>
            {curso.subtitulo && (
              <p className="max-w-xl text-sm text-km-ink-soft">{curso.subtitulo}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-mono text-[11px] text-km-ink-faint">
              <span>
                {aulas.length} aula{aulas.length === 1 ? "" : "s"}
              </span>
              {curso.cargaHorariaMinutos > 0 && (
                <span>{formatarDuracao(curso.cargaHorariaMinutos)}</span>
              )}
              {temAcesso ? (
                <span className="text-km-brand">
                  {motivo === "ASSINATURA"
                    ? "pela comunidade"
                    : motivo === "ADMIN"
                      ? "pré-visualização"
                      : expiraEm
                        ? `acesso até ${formatarData(expiraEm)}`
                        : "acesso liberado"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-km-ink-faint">
                  <Lock className="size-3" />
                  {liberadas} de {aulas.length} liberada{liberadas === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {temAcesso ? (
              <>
                {percentual > 0 && (
                  <div className="flex w-40 items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-km-sunk">
                      <div
                        className="h-full rounded-full bg-km-brand"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-km-ink-faint tabular-nums">
                      {percentual}%
                    </span>
                  </div>
                )}
                {proxima && (
                  <Link
                    href={`/aluno/curso/${curso.slug}/${proxima.slug}`}
                    className="inline-flex items-center gap-2 rounded-md bg-km-brand px-5 py-2.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
                  >
                    <PlayCircle className="size-4" />
                    {percentual > 0 ? "Continuar" : "Começar"}
                  </Link>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setPainelAberto(true)}
                className="inline-flex items-center gap-2 rounded-md bg-km-brand px-5 py-2.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
              >
                <Lock className="size-4" />
                Liberar por {formatarPreco(curso.precoCentavos)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* fita de cards */}
      <div className="group/fita relative">
        <div
          ref={fita}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {aulas.map((aula, i) => (
            <div key={aula.id} className="snap-start">
              <CardAula
                aula={aula}
                cursoSlug={curso.slug}
                indice={i}
                aoClicarBloqueada={() => setPainelAberto(true)}
              />
            </div>
          ))}
        </div>

        {aulas.length > 3 && (
          <>
            <button
              type="button"
              onClick={() => rolar(-1)}
              aria-label="Ver aulas anteriores"
              className="absolute top-1/2 left-1 hidden -translate-y-1/2 place-items-center rounded-full bg-black/70 p-2 text-white opacity-0 backdrop-blur transition-opacity group-hover/fita:opacity-100 focus-visible:opacity-100 sm:grid"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => rolar(1)}
              aria-label="Ver próximas aulas"
              className="absolute top-1/2 right-1 hidden -translate-y-1/2 place-items-center rounded-full bg-black/70 p-2 text-white opacity-0 backdrop-blur transition-opacity group-hover/fita:opacity-100 focus-visible:opacity-100 sm:grid"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <PainelDeAcesso
        aberto={painelAberto}
        aoFechar={() => setPainelAberto(false)}
        curso={curso}
        totalDeAulas={aulas.length}
        precoComunidadeCentavos={precoComunidadeCentavos}
      />
    </section>
  )
}
