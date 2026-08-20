"use client"

import Link from "next/link"
import { Check, Infinity as InfinityIcon, Radio, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatarPreco } from "@/lib/formato"
import { marca } from "@/config/landing"

/**
 * O que aparece ao clicar num cadeado.
 *
 * Abre aqui em vez de pular para outra página: a decisão acontece no contexto,
 * com a aula que ela quis abrir ainda na cabeça. Mostra as duas saídas —
 * comprar o curso, ou assinar a comunidade e destravar tudo.
 */
export function PainelDeAcesso({
  aberto,
  aoFechar,
  curso,
  totalDeAulas,
  precoComunidadeCentavos,
}: {
  aberto: boolean
  aoFechar: () => void
  curso: { titulo: string; slug: string; precoCentavos: number; acessoDias: number | null }
  totalDeAulas: number
  precoComunidadeCentavos: number | null
}) {
  const anos = curso.acessoDias ? Math.round(curso.acessoDias / 365) : 0
  const prazo =
    !curso.acessoDias
      ? "acesso vitalício"
      : anos >= 1
        ? `${anos} ano${anos > 1 ? "s" : ""} de acesso`
        : `${curso.acessoDias} dias de acesso`

  function linkWhatsapp(mensagem: string) {
    if (!marca.whatsapp) return null
    return `https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(mensagem)}`
  }

  const compraHref = linkWhatsapp(`Olá! Quero liberar o curso "${curso.titulo}".`)
  const comunidadeHref = linkWhatsapp("Olá! Quero assinar a comunidade e ter acesso a todos os cursos.")

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Esta aula está bloqueada</DialogTitle>
          <DialogDescription>
            Escolha como quer destravar — só este curso, ou tudo de uma vez.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {/* curso avulso */}
          <div className="rounded-xl border border-km-line bg-km-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-km-ink">
                {curso.titulo}
              </h3>
              <span className="font-display text-xl font-semibold text-km-ink">
                {formatarPreco(curso.precoCentavos)}
              </span>
            </div>

            <ul className="flex flex-col gap-1.5 pt-3 text-sm text-km-ink-soft">
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-km-brand" />
                As {totalDeAulas} aulas deste curso
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-km-brand" />
                {prazo}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-km-brand" />
                Certificado ao concluir
              </li>
            </ul>

            {compraHref ? (
              <a
                href={compraHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-km-brand px-5 py-3 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
              >
                Quero este curso
              </a>
            ) : (
              // Sem WhatsApp e sem checkout ainda: a página do curso é o destino
              // útil que sempre existe. Cadeado nunca pode ficar sem saída.
              // TODO: trocar por checkout Stripe quando o pagamento entrar.
              <Link
                href={`/cursos/${curso.slug}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-km-brand px-5 py-3 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
              >
                Ver detalhes do curso
              </Link>
            )}
          </div>

          {/* comunidade */}
          <div className="rounded-xl border border-km-brand/40 bg-km-brand-soft p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-km-brand px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider text-km-on-brand uppercase">
              <Sparkles className="size-3" />
              melhor escolha
            </span>

            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
              <h3 className="font-display text-lg font-semibold text-km-ink">Comunidade</h3>
              {precoComunidadeCentavos !== null && (
                <span className="font-display text-xl font-semibold text-km-ink">
                  {formatarPreco(precoComunidadeCentavos)}
                  <span className="font-sans text-sm font-normal text-km-ink-soft">/mês</span>
                </span>
              )}
            </div>

            <ul className="flex flex-col gap-1.5 pt-3 text-sm text-km-ink-soft">
              <li className="flex items-center gap-2">
                <InfinityIcon className="size-4 shrink-0 text-km-brand" />
                Todos os cursos, inclusive os que ainda vão sair
              </li>
              <li className="flex items-center gap-2">
                <Radio className="size-4 shrink-0 text-km-brand" />
                Lives com a Dra. Karollyne
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-km-brand" />
                Cancele quando quiser
              </li>
            </ul>

            {comunidadeHref ? (
              <a
                href={comunidadeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-km-brand px-5 py-3 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
              >
                Assinar a comunidade
              </a>
            ) : (
              <p className="mt-4 rounded-md border border-km-brand/30 px-4 py-3 text-center text-xs leading-relaxed text-km-ink-soft">
                Preencha <code className="font-mono">marca.whatsapp</code> em{" "}
                <code className="font-mono">src/config/landing.ts</code> para ativar o
                botão de assinatura.
              </p>
            )}
          </div>

          <p className="text-center text-xs leading-relaxed text-km-ink-faint">
            O pagamento online entra em breve. Por enquanto o acesso é liberado
            manualmente — e seu progresso nas aulas gratuitas fica guardado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
