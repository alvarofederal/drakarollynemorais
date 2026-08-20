import { cn } from "@/lib/utils"

/* Estilos compartilhados pelos formulários do painel. */

export const inputBase =
  "w-full rounded-md border border-km-line bg-km-bg px-3.5 py-2.5 text-sm text-km-ink placeholder:text-km-ink-faint transition-colors focus:border-km-brand focus:outline-none focus:ring-2 focus:ring-km-brand/25 disabled:opacity-60"

export const botaoPrimario =
  "inline-flex items-center justify-center gap-2 rounded-md bg-km-brand px-5 py-2.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover disabled:cursor-not-allowed disabled:opacity-60"

export const botaoSecundario =
  "inline-flex items-center justify-center gap-2 rounded-md border border-km-line bg-km-bg px-5 py-2.5 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand disabled:cursor-not-allowed disabled:opacity-60"

export const botaoIcone =
  "inline-flex size-8 items-center justify-center rounded-md text-km-ink-faint transition-colors hover:bg-km-sunk hover:text-km-ink disabled:cursor-not-allowed disabled:opacity-30"

export function Campo({
  rotulo,
  htmlFor,
  dica,
  children,
  className,
}: {
  rotulo: string
  htmlFor: string
  dica?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-km-ink">
        {rotulo}
      </label>
      {children}
      {dica && <p className="text-xs text-km-ink-faint">{dica}</p>}
    </div>
  )
}

export function Aviso({ texto, tom = "erro" }: { texto: string; tom?: "erro" | "ok" }) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-md border px-3.5 py-2.5 text-sm",
        tom === "erro"
          ? "border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400"
          : "border-km-brand/30 bg-km-brand-soft text-km-brand"
      )}
    >
      {texto}
    </p>
  )
}

const CORES_STATUS = {
  RASCUNHO: "bg-km-sunk text-km-ink-soft",
  PUBLICADO: "bg-km-brand-soft text-km-brand",
  ARQUIVADO: "bg-km-gold-soft text-km-gold",
} as const

export function EtiquetaStatus({ status }: { status: keyof typeof CORES_STATUS }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
        CORES_STATUS[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  )
}
