import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, PlayCircle } from "lucide-react"
import { auth } from "@/lib/auth"
import { listarCursosDoAluno } from "@/lib/cursos"
import { formatarData, formatarDuracao } from "@/lib/formato"
import { Wordmark } from "@/app/_components/landing/site-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/app/_components/auth/sign-out-button"

export const metadata: Metadata = {
  title: "Meus cursos",
  robots: { index: false, follow: false },
}

export default async function AlunoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const matriculas = await listarCursosDoAluno(session.user.id)

  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <header className="border-b border-km-line">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
          <Wordmark />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full px-5 py-12 sm:px-8 sm:py-14">
        <p className="font-mono text-xs tracking-[0.14em] text-km-brand uppercase">
          Área do aluno
        </p>
        <h1 className="pt-3 font-display text-3xl font-semibold tracking-tight text-km-ink sm:text-4xl">
          Olá, {session.user.name ?? "tudo certo"}.
        </h1>

        {matriculas.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-km-line bg-km-surface p-10 text-center sm:p-14">
            <h2 className="font-display text-2xl font-semibold text-km-ink">
              Você ainda não tem nenhum curso
            </h2>
            <p className="mx-auto mt-3 max-w-md text-km-ink-soft">
              Assim que seu acesso a um curso for liberado, ele aparece aqui com o player
              das aulas e os materiais para baixar.
            </p>
            <Link
              href="/#cursos"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-km-brand px-6 py-3 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
            >
              Ver os cursos disponíveis
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="pt-2 text-sm text-km-ink-soft">
              {matriculas.length} curso{matriculas.length === 1 ? "" : "s"} liberado
              {matriculas.length === 1 ? "" : "s"} para você.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matriculas.map((m) => {
                const aulas = m.curso.modulos.reduce((t, mod) => t + mod._count.aulas, 0)
                return (
                  <article
                    key={m.id}
                    className="flex flex-col gap-4 rounded-xl border border-km-line bg-km-surface p-6"
                  >
                    <div className="flex flex-col gap-2">
                      <h2 className="font-display text-xl leading-snug font-semibold text-km-ink">
                        {m.curso.titulo}
                      </h2>
                      {m.curso.subtitulo && (
                        <p className="text-sm leading-relaxed text-km-ink-soft">
                          {m.curso.subtitulo}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-[11px] text-km-ink-faint">
                          {m.percentualConcluido}% concluído
                        </span>
                        <span className="font-mono text-[11px] text-km-ink-faint tabular-nums">
                          {aulas} aula{aulas === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-km-sunk">
                        <div
                          className="h-full rounded-full bg-km-brand transition-all"
                          style={{ width: `${m.percentualConcluido}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3 border-t border-km-line-soft pt-4">
                      <span className="font-mono text-[11px] text-km-ink-faint">
                        {m.curso.cargaHorariaMinutos > 0 &&
                          `${formatarDuracao(m.curso.cargaHorariaMinutos)} · `}
                        {m.expiraEm
                          ? `acesso até ${formatarData(m.expiraEm)}`
                          : "acesso vitalício"}
                      </span>

                      <Link
                        href={`/aluno/curso/${m.curso.slug}`}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-km-brand px-4 py-2.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
                      >
                        <PlayCircle className="size-4" />
                        {m.percentualConcluido > 0 ? "Continuar" : "Começar"}
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}

        {session.user.role === "ADMIN" && (
          <p className="pt-8 text-sm text-km-ink-soft">
            Você é administradora —{" "}
            <Link href="/admin" className="font-medium text-km-brand hover:underline">
              ir para o painel
            </Link>
          </p>
        )}
      </main>
    </div>
  )
}
