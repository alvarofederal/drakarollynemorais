import Image from "next/image"
import { Check, FileText, Play } from "lucide-react"
import { hero } from "@/config/landing"

/**
 * Prévia da sala de aula.
 *
 * Ocupa o lugar do mockup de dispositivo da referência, mas mostra o produto
 * de verdade em vez de uma foto de banco de imagens: o player, a marca d'água
 * com o nome do aluno, a trilha de aulas e o material da aula.
 */
function PreviaSalaDeAula() {
  const aulas = [
    { titulo: "Abertura do módulo", duracao: "6 min", estado: "concluida" as const },
    { titulo: "Avaliação inicial", duracao: "18 min", estado: "atual" as const },
    { titulo: "Conduta na prática", duracao: "24 min", estado: "pendente" as const },
  ]

  return (
    <div className="relative">
      {/* halo suave atrás do cartão */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-km-brand-soft/70 blur-2xl"
      />

      <div className="overflow-hidden rounded-xl border border-km-line bg-km-surface shadow-[0_24px_60px_-30px_rgba(18,26,22,0.35)]">
        {/* player */}
        <div className="relative aspect-video bg-km-band">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="absolute inset-0 grid place-items-center">
            <div className="grid size-14 place-items-center rounded-full bg-white/95 shadow-lg">
              <Play className="size-5 translate-x-px fill-km-band text-km-band" />
            </div>
          </div>

          {/* marca d'água — o recurso antipirataria, mostrado em vez de descrito */}
          <span className="absolute top-3 right-3 font-mono text-[10px] tracking-wide text-white/35">
            dr.exemplo@email.com
          </span>

          {/* barra de progresso do player */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-white/70 tabular-nums">07:12</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[38%] rounded-full bg-white/90" />
              </div>
              <span className="font-mono text-[10px] text-white/70 tabular-nums">18:00</span>
            </div>
          </div>
        </div>

        {/* trilha */}
        <div className="p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-base font-semibold text-km-ink">
              Módulo 2 — Avaliação inicial
            </p>
            <span className="shrink-0 font-mono text-[11px] text-km-ink-faint tabular-nums">
              38%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-km-sunk">
            <div className="h-full w-[38%] rounded-full bg-km-brand" />
          </div>

          <ul className="mt-4 divide-y divide-km-line-soft">
            {aulas.map((aula) => (
              <li key={aula.titulo} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden
                  className={
                    aula.estado === "concluida"
                      ? "grid size-5 shrink-0 place-items-center rounded-full bg-km-brand text-km-on-brand"
                      : aula.estado === "atual"
                        ? "grid size-5 shrink-0 place-items-center rounded-full border-2 border-km-brand"
                        : "grid size-5 shrink-0 place-items-center rounded-full border border-km-line"
                  }
                >
                  {aula.estado === "concluida" && <Check className="size-3" />}
                  {aula.estado === "atual" && (
                    <span className="size-1.5 rounded-full bg-km-brand" />
                  )}
                </span>
                <span
                  className={
                    aula.estado === "pendente"
                      ? "flex-1 text-sm text-km-ink-faint"
                      : "flex-1 text-sm text-km-ink"
                  }
                >
                  {aula.titulo}
                </span>
                <span className="font-mono text-[11px] text-km-ink-faint tabular-nums">
                  {aula.duracao}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-km-line-soft pt-4">
            {["Slides da aula.pdf", "Resumo prático.pdf"].map((arquivo) => (
              <span
                key={arquivo}
                className="inline-flex items-center gap-1.5 rounded-md bg-km-sunk px-2.5 py-1.5 text-xs text-km-ink-soft"
              >
                <FileText className="size-3.5 text-km-brand" />
                {arquivo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full items-center gap-12 px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full border border-km-line bg-km-surface px-3 py-1 text-xs font-medium tracking-wide text-km-brand uppercase">
            {hero.eyebrow}
          </span>

          <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-km-ink sm:text-5xl lg:text-[3.4rem]">
            {hero.titulo}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-km-ink-soft sm:text-lg">
            {hero.subtitulo}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={hero.ctaPrimario.href}
              className="inline-flex items-center justify-center rounded-md bg-km-brand px-6 py-3.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
            >
              {hero.ctaPrimario.rotulo}
            </a>
            <a
              href={hero.ctaSecundario.href}
              className="inline-flex items-center justify-center rounded-md border border-km-line bg-km-surface px-6 py-3.5 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
            >
              {hero.ctaSecundario.rotulo}
            </a>
          </div>
        </div>

        {hero.foto ? (
          <div className="relative overflow-hidden rounded-xl border border-km-line bg-km-surface">
            <Image
              src={hero.foto.src}
              alt={hero.foto.alt}
              width={720}
              height={880}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        ) : (
          <PreviaSalaDeAula />
        )}
      </div>
    </section>
  )
}
