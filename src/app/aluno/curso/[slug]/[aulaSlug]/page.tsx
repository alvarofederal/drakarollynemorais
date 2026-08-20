import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Check, Eye, FileText, Lock, Video } from "lucide-react"
import { auth } from "@/lib/auth"
import { obterSalaDeAula } from "@/lib/cursos"
import { assinarTokenDeReproducao, urlDoPlayer } from "@/lib/stream"
import { formatarDuracao } from "@/lib/formato"
import { Wordmark } from "@/app/_components/landing/site-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/app/_components/auth/sign-out-button"
import { cn } from "@/lib/utils"
import { PlayerAula, PlayerIndisponivel } from "./_components/player-aula"
import { AcoesAula } from "./_components/acoes-aula"

export const metadata: Metadata = {
  title: "Sala de aula",
  robots: { index: false, follow: false },
}

const ICONE_TIPO = { VIDEO: Video, TEXTO: FileText, PDF: FileText } as const

export default async function SalaDeAulaPage({
  params,
}: {
  params: Promise<{ slug: string; aulaSlug: string }>
}) {
  const { slug, aulaSlug } = await params

  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/aluno/curso/${slug}/${aulaSlug}`)

  const sala = await obterSalaDeAula({
    slugCurso: slug,
    userId: session.user.id,
    papel: session.user.role,
  })
  if (!sala) notFound()

  const { curso, acessoLiberado, matricula, trilha } = sala

  const indice = trilha.findIndex((a) => a.slug === aulaSlug)
  if (indice === -1) notFound()

  const aula = trilha[indice]

  // Sem acesso e a aula não é amostra: manda para a página de vendas
  if (!aula.liberada) redirect(`/cursos/${curso.slug}`)

  const anterior = trilha[indice - 1]
  const proxima = trilha[indice + 1]
  const href = (a?: (typeof trilha)[number]) =>
    a && a.liberada ? `/aluno/curso/${curso.slug}/${a.slug}` : null

  // A ADMIN entra sem matrícula — é a pré-visualização do que o aluno vê
  const ehPreVisualizacao = session.user.role === "ADMIN" && !matricula

  const concluidas = trilha.filter((a) => a.concluida).length
  const percentual = matricula?.percentualConcluido ?? 0

  // O token é assinado agora, no servidor, depois de o acesso ter sido conferido
  let srcDoPlayer: string | null = null
  if (aula.tipo === "VIDEO" && aula.videoUid && aula.videoPronto) {
    srcDoPlayer = urlDoPlayer(assinarTokenDeReproducao(aula.videoUid))
  }

  const identificacao = `${session.user.name ?? ""} · ${session.user.email ?? ""}`.trim()

  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <header className="border-b border-km-line">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Wordmark />
            <Link
              href="/aluno"
              className="hidden items-center gap-1.5 text-xs text-km-ink-faint transition-colors hover:text-km-brand sm:inline-flex"
            >
              <ArrowLeft className="size-3.5" />
              Meus cursos
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      {ehPreVisualizacao && (
        <div className="border-b border-km-gold/40 bg-km-gold-soft">
          <div className="mx-auto flex w-full flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
            <Eye className="size-4 shrink-0 text-km-gold" />
            <p className="flex-1 text-sm text-km-gold">
              <strong className="font-medium">Pré-visualização.</strong> Você está vendo a
              sala de aula exatamente como o aluno vê. Seu progresso não é registrado.
            </p>
            <Link
              href={`/admin/cursos`}
              className="text-sm font-medium text-km-gold underline underline-offset-2"
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto grid w-full gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
        {/* ─── palco ─── */}
        <div className="flex min-w-0 flex-col gap-6">
          {srcDoPlayer ? (
            <PlayerAula src={srcDoPlayer} identificacao={identificacao} />
          ) : aula.tipo === "VIDEO" ? (
            <PlayerIndisponivel mensagem="O vídeo desta aula ainda está sendo processado. Volte em alguns minutos." />
          ) : (
            <PlayerIndisponivel mensagem="Esta aula não tem vídeo — o conteúdo está na descrição e nos materiais." />
          )}

          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs tracking-wide text-km-brand uppercase">
              {aula.moduloTitulo}
            </p>
            <h1 className="font-display text-2xl leading-tight font-semibold text-km-ink sm:text-3xl">
              {aula.titulo}
            </h1>
            {aula.duracaoSegundos ? (
              <p className="font-mono text-xs text-km-ink-faint">
                {formatarDuracao(Math.round(aula.duracaoSegundos / 60))}
              </p>
            ) : null}
          </div>

          {aula.descricao && (
            <div className="flex max-w-3xl flex-col gap-3 text-km-ink-soft">
              {aula.descricao.split("\n").map((p, i) =>
                p.trim() ? (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ) : null
              )}
            </div>
          )}

          <AcoesAula
            aulaId={aula.id}
            concluida={aula.concluida}
            podeRegistrarProgresso={!!matricula}
            hrefAnterior={href(anterior)}
            hrefProxima={href(proxima)}
          />
        </div>

        {/* ─── trilha ─── */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-xl border border-km-line bg-km-surface p-5">
            <p className="font-display text-base font-semibold text-km-ink">{curso.titulo}</p>
            <div className="flex items-baseline justify-between gap-3 pt-3">
              <span className="font-mono text-[11px] text-km-ink-faint">
                {concluidas} de {trilha.length} aulas
              </span>
              <span className="font-mono text-[11px] text-km-ink-faint tabular-nums">
                {percentual}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-km-sunk">
              <div
                className="h-full rounded-full bg-km-brand transition-all"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>

          <nav className="overflow-hidden rounded-xl border border-km-line bg-km-surface">
            {curso.modulos.map((modulo) => {
              const aulas = trilha.filter((a) => a.moduloId === modulo.id)
              if (aulas.length === 0) return null

              return (
                <div key={modulo.id}>
                  <p className="border-b border-km-line-soft bg-km-sunk/60 px-4 py-2.5 font-mono text-[10px] tracking-wider text-km-ink-faint uppercase">
                    {modulo.titulo}
                  </p>
                  <ul className="divide-y divide-km-line-soft">
                    {aulas.map((a) => {
                      const Icone = ICONE_TIPO[a.tipo]
                      const atual = a.slug === aulaSlug
                      const conteudo = (
                        <>
                          {a.concluida ? (
                            <Check className="size-4 shrink-0 text-km-brand" />
                          ) : a.liberada ? (
                            <Icone className="size-4 shrink-0 text-km-ink-faint" />
                          ) : (
                            <Lock className="size-4 shrink-0 text-km-ink-faint" />
                          )}
                          <span className="min-w-0 flex-1 truncate">{a.titulo}</span>
                          {a.duracaoSegundos ? (
                            <span className="shrink-0 font-mono text-[10px] text-km-ink-faint tabular-nums">
                              {formatarDuracao(Math.round(a.duracaoSegundos / 60))}
                            </span>
                          ) : null}
                        </>
                      )

                      const classe = cn(
                        "flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors",
                        atual
                          ? "bg-km-brand-soft font-medium text-km-brand"
                          : a.liberada
                            ? "text-km-ink hover:bg-km-sunk/60"
                            : "cursor-not-allowed text-km-ink-faint"
                      )

                      return (
                        <li key={a.id}>
                          {a.liberada ? (
                            <Link
                              href={`/aluno/curso/${curso.slug}/${a.slug}`}
                              className={classe}
                              aria-current={atual ? "page" : undefined}
                            >
                              {conteudo}
                            </Link>
                          ) : (
                            <span className={classe}>{conteudo}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </nav>

          {!acessoLiberado && (
            <Link
              href={`/cursos/${curso.slug}`}
              className="rounded-md bg-km-brand px-4 py-3 text-center text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
            >
              Liberar o curso completo
            </Link>
          )}
        </aside>
      </main>
    </div>
  )
}
