import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Wordmark } from "@/app/_components/landing/site-header"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Moldura das telas de autenticação: login, cadastro, recuperação de senha.
 * Mantém a marca visível e o seletor de tema ao alcance.
 */
export function AuthShell({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string
  subtitulo?: string
  children: React.ReactNode
  rodape?: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-km-bg text-km-ink">
      {/* brilho discreto da marca ao fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, var(--km-brand-soft), transparent 70%)",
        }}
      />

      <header className="mx-auto flex w-full items-center justify-between px-5 py-6 sm:px-8">
        <Wordmark />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-16 sm:px-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-2 pb-7 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-balance text-km-ink">
              {titulo}
            </h1>
            {subtitulo && <p className="text-sm text-km-ink-soft">{subtitulo}</p>}
          </div>

          <div className="rounded-xl border border-km-line bg-km-surface p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)] sm:p-8">
            {children}
          </div>

          {rodape && (
            <div className="pt-6 text-center text-sm text-km-ink-soft">{rodape}</div>
          )}

          <div className="pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-km-ink-faint transition-colors hover:text-km-brand"
            >
              <ArrowLeft className="size-3.5" />
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── peças reaproveitadas pelos formulários ─────────────────── */

export function CampoRotulo({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-km-ink">
      {children}
    </label>
  )
}

export const classeInput =
  "w-full rounded-md border border-km-line bg-km-bg px-3.5 py-2.5 text-sm text-km-ink placeholder:text-km-ink-faint transition-colors focus:border-km-brand focus:outline-none focus:ring-2 focus:ring-km-brand/25 disabled:opacity-60"

export const classeBotaoPrimario =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-km-brand px-4 py-3 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover disabled:cursor-not-allowed disabled:opacity-60"

export const classeBotaoSecundario =
  "inline-flex w-full items-center justify-center gap-2.5 rounded-md border border-km-line bg-km-bg px-4 py-3 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand disabled:cursor-not-allowed disabled:opacity-60"

export function Separador({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-km-line" />
      <span className="text-xs text-km-ink-faint">{texto}</span>
      <span className="h-px flex-1 bg-km-line" />
    </div>
  )
}

export function IconeGoogle() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
      />
    </svg>
  )
}

export function MensagemErro({ texto }: { texto: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-500 dark:text-red-400"
    >
      {texto}
    </p>
  )
}
