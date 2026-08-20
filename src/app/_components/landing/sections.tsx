import Image from "next/image"
import {
  Award,
  FileDown,
  History,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react"
import {
  comoFunciona,
  ctaFinal,
  cursos,
  depoimentos,
  marca,
  numeros,
  oQueRecebe,
  pagamento,
  sobre,
} from "@/config/landing"
import { cn } from "@/lib/utils"

const ICONES: Record<string, LucideIcon> = {
  PlayCircle,
  FileDown,
  Smartphone,
  History,
  Award,
  RefreshCw,
}

/* ─── blocos compartilhados ──────────────────────────────────── */

function Secao({
  id,
  fundo = "claro",
  className,
  children,
}: {
  id?: string
  fundo?: "claro" | "recuado"
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 py-20 sm:py-28",
        fundo === "recuado" && "border-y border-km-line bg-km-sunk",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  )
}

function TituloSecao({
  eyebrow,
  titulo,
  texto,
  centralizado = false,
}: {
  eyebrow?: string
  titulo: string
  texto?: string
  centralizado?: boolean
}) {
  return (
    <div className={cn("flex flex-col gap-4", centralizado && "items-center text-center")}>
      {eyebrow && (
        <span className="font-mono text-xs tracking-[0.14em] text-km-brand uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl font-display text-3xl leading-tight font-semibold tracking-tight text-balance text-km-ink sm:text-4xl">
        {titulo}
      </h2>
      {texto && <p className="max-w-xl text-base text-km-ink-soft">{texto}</p>}
    </div>
  )
}

/* ─── números (some enquanto não houver dados reais) ─────────── */

export function Numeros() {
  if (numeros.length === 0) return null

  return (
    <Secao fundo="recuado" className="py-14 sm:py-16">
      <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {numeros.map((n) => (
          <div key={n.label} className="flex flex-col gap-1">
            <dt className="sr-only">{n.label}</dt>
            <dd className="font-display text-3xl font-semibold text-km-brand tabular-nums sm:text-4xl">
              {n.valor}
            </dd>
            <p className="text-sm text-km-ink-soft">{n.label}</p>
          </div>
        ))}
      </dl>
    </Secao>
  )
}

/* ─── como funciona ──────────────────────────────────────────── */

export function ComoFunciona() {
  return (
    <Secao id="como-funciona" fundo="recuado">
      <TituloSecao
        eyebrow="Como funciona"
        titulo="Do primeiro clique ao certificado, em três passos."
      />

      <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-km-line bg-km-line sm:grid-cols-3">
        {comoFunciona.map((passo) => (
          <li key={passo.passo} className="flex flex-col gap-3 bg-km-surface p-7">
            <span className="font-mono text-sm text-km-brand tabular-nums">{passo.passo}</span>
            <h3 className="font-display text-xl font-semibold text-km-ink">{passo.titulo}</h3>
            <p className="text-sm leading-relaxed text-km-ink-soft">{passo.texto}</p>
          </li>
        ))}
      </ol>
    </Secao>
  )
}

/* ─── o que você recebe ──────────────────────────────────────── */

export function OQueRecebe() {
  return (
    <Secao>
      <TituloSecao
        eyebrow="O que está incluído"
        titulo="Tudo o que você recebe ao se inscrever."
      />

      <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {oQueRecebe.map((item) => {
          const Icone = ICONES[item.icone] ?? PlayCircle
          return (
            <div key={item.titulo} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-km-brand-soft text-km-brand">
                <Icone className="size-5" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-medium text-km-ink">{item.titulo}</h3>
                <p className="text-sm leading-relaxed text-km-ink-soft">{item.texto}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Secao>
  )
}

/* ─── catálogo ───────────────────────────────────────────────── */

export function Catalogo() {
  return (
    <Secao id="cursos" fundo="recuado">
      <TituloSecao eyebrow="Cursos" titulo="Escolha por onde começar." />

      {cursos.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-km-line bg-km-surface p-10 text-center sm:p-14">
          <h3 className="font-display text-2xl font-semibold text-km-ink">
            Primeira turma em breve
          </h3>
          <p className="mx-auto mt-3 max-w-md text-km-ink-soft">
            Os cursos estão sendo preparados. Deixe seu contato para ser avisado assim que as
            inscrições abrirem.
          </p>
          {marca.whatsapp ? (
            <a
              href={`https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(
                "Olá! Quero ser avisado quando os cursos abrirem."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center justify-center rounded-md bg-km-brand px-6 py-3.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
            >
              Quero ser avisado
            </a>
          ) : (
            <p className="mt-7 font-mono text-xs text-km-ink-faint">
              {/* TODO: configurar `marca.whatsapp` para ativar o botão de contato */}
              Canal de contato a configurar
            </p>
          )}
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso) => (
            <article
              key={curso.slug}
              className="flex flex-col gap-4 rounded-xl border border-km-line bg-km-surface p-6 transition-shadow hover:shadow-[0_16px_40px_-24px_rgba(18,26,22,0.4)]"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xl leading-snug font-semibold text-km-ink">
                  {curso.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-km-ink-soft">{curso.resumo}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-km-line-soft pt-4 font-mono text-xs text-km-ink-faint">
                <span>{curso.aulas} aulas</span>
                <span>{curso.cargaHoraria}</span>
                <span className="ml-auto text-sm font-medium text-km-brand">{curso.preco}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </Secao>
  )
}

/* ─── sobre a Dra. ───────────────────────────────────────────── */

export function Sobre() {
  return (
    <Secao id="sobre">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
        {sobre.foto ? (
          <div className="overflow-hidden rounded-xl border border-km-line bg-km-surface">
            <Image
              src={sobre.foto.src}
              alt={sobre.foto.alt}
              width={640}
              height={800}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden
            className="grid min-h-[18rem] place-items-center rounded-xl border border-dashed border-km-line bg-km-sunk p-8 text-center"
          >
            {/* TODO: substituir por `sobre.foto` quando a foto profissional chegar */}
            <span className="font-mono text-xs tracking-wide text-km-ink-faint uppercase">
              Foto profissional
            </span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <TituloSecao eyebrow="Quem ensina" titulo={sobre.titulo} />

          <div className="flex flex-col gap-4 text-km-ink-soft">
            {sobre.paragrafos.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {/* Identificação profissional — exigida na publicidade médica (CFM 2.336/2023) */}
          <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-km-line pt-6 font-mono text-xs">
            <div className="flex flex-col gap-1">
              <dt className="tracking-wide text-km-ink-faint uppercase">Especialidade</dt>
              <dd className="text-km-ink">{sobre.credenciais.especialidade}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="tracking-wide text-km-ink-faint uppercase">CRM</dt>
              <dd className="text-km-ink">{sobre.credenciais.crm}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="tracking-wide text-km-ink-faint uppercase">RQE</dt>
              <dd className="text-km-ink">{sobre.credenciais.rqe}</dd>
            </div>
          </dl>
        </div>
      </div>
    </Secao>
  )
}

/* ─── depoimentos (some enquanto não houver dados reais) ─────── */

export function Depoimentos() {
  if (depoimentos.length === 0) return null

  return (
    <Secao fundo="recuado">
      <TituloSecao eyebrow="Quem já estudou" titulo="O que os alunos dizem." />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {depoimentos.map((d) => (
          <figure
            key={d.nome}
            className="flex flex-col gap-5 rounded-xl border border-km-line bg-km-surface p-6"
          >
            <blockquote className="font-display text-lg leading-relaxed text-km-ink">
              &ldquo;{d.texto}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 border-t border-km-line-soft pt-4">
              {d.foto && (
                <Image
                  src={d.foto}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-km-ink">{d.nome}</span>
                <span className="text-xs text-km-ink-faint">{d.cargo}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Secao>
  )
}

/* ─── pagamento e garantia ───────────────────────────────────── */

export function Pagamento() {
  return (
    <Secao>
      <div className="grid gap-10 rounded-xl border border-km-line bg-km-surface p-8 sm:p-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <span className="grid size-11 place-items-center rounded-lg bg-km-gold-soft text-km-gold">
            <ShieldCheck className="size-5" />
          </span>
          <h2 className="font-display text-2xl leading-tight font-semibold text-balance text-km-ink sm:text-3xl">
            {pagamento.titulo}
          </h2>
          <p className="leading-relaxed text-km-ink-soft">{pagamento.texto}</p>
        </div>

        <ul className="flex flex-col divide-y divide-km-line-soft">
          {pagamento.selos.map((selo) => (
            <li key={selo} className="flex items-start gap-3 py-3.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-km-brand" />
              <span className="text-sm text-km-ink-soft">{selo}</span>
            </li>
          ))}
        </ul>
      </div>
    </Secao>
  )
}

/* ─── chamada final ──────────────────────────────────────────── */

export function CtaFinal() {
  return (
    <section className="border-t border-km-line bg-km-band">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 sm:py-24">
        <h2 className="max-w-2xl font-display text-3xl leading-tight font-semibold text-balance text-km-band-ink sm:text-4xl">
          {ctaFinal.titulo}
        </h2>
        <p className="max-w-lg text-km-band-ink-soft">{ctaFinal.texto}</p>
        <a
          href={ctaFinal.cta.href}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-km-band-cta-bg px-7 py-3.5 text-sm font-medium text-km-band-cta-ink transition-colors hover:opacity-90"
        >
          {ctaFinal.cta.rotulo}
        </a>
      </div>
    </section>
  )
}
