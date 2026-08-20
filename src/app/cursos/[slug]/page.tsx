import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Award, Clock, Lock, PlayCircle, Unlock } from "lucide-react"
import { auth } from "@/lib/auth"
import { verificarAcesso } from "@/lib/acesso"
import { obterCursoPublico } from "@/lib/cursos"
import { formatarDuracao, formatarPreco } from "@/lib/formato"
import { marca } from "@/config/landing"
import { SiteHeader } from "@/app/_components/landing/site-header"
import { SiteFooter } from "@/app/_components/landing/site-footer"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const curso = await obterCursoPublico(slug)
  if (!curso) return { title: "Curso não encontrado" }

  return {
    title: curso.titulo,
    description: curso.subtitulo ?? curso.descricao?.slice(0, 160) ?? undefined,
    openGraph: {
      title: curso.titulo,
      description: curso.subtitulo ?? undefined,
      url: `/cursos/${curso.slug}`,
      type: "website",
    },
  }
}

export default async function CursoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const curso = await obterCursoPublico(slug)
  if (!curso) notFound()

  const session = await auth()
  const temAcesso = session?.user
    ? await verificarAcesso(session.user.id, curso.id, session.user.role)
    : false

  const totalAulas = curso.modulos.reduce((t, m) => t + m.aulas.length, 0)

  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <SiteHeader />

      <main>
        {/* ─── capa ─── */}
        <section className="border-b border-km-line">
          <div className="mx-auto grid w-full gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div className="flex flex-col items-start gap-5">
              <span className="font-mono text-xs tracking-[0.14em] text-km-brand uppercase">
                {curso.nivel === "INTRODUTORIO"
                  ? "Introdutório"
                  : curso.nivel === "INTERMEDIARIO"
                    ? "Intermediário"
                    : "Avançado"}
              </span>

              <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance text-km-ink sm:text-5xl">
                {curso.titulo}
              </h1>

              {curso.subtitulo && (
                <p className="max-w-2xl text-lg leading-relaxed text-km-ink-soft">
                  {curso.subtitulo}
                </p>
              )}

              {curso.professor && (
                <p className="text-sm text-km-ink-soft">
                  com <span className="font-medium text-km-ink">{curso.professor.nome}</span>
                  {curso.professor.titulacao && ` · ${curso.professor.titulacao}`}
                  {curso.professor.crm && ` · ${curso.professor.crm}`}
                </p>
              )}

              <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2 font-mono text-xs text-km-ink-faint">
                <div className="flex items-center gap-2">
                  <PlayCircle className="size-4 text-km-brand" />
                  {totalAulas} aula{totalAulas === 1 ? "" : "s"}
                </div>
                {curso.cargaHorariaMinutos > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-km-brand" />
                    {formatarDuracao(curso.cargaHorariaMinutos)}
                  </div>
                )}
                {curso.emiteCertificado && (
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-km-brand" />
                    Certificado
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {curso.tipoAcesso === "VITALICIO"
                    ? "Acesso vitalício"
                    : `Acesso por ${curso.acessoDias} dias`}
                </div>
              </dl>
            </div>

            {/* ─── cartão de inscrição ─── */}
            <aside className="h-fit rounded-xl border border-km-line bg-km-surface p-6 sm:p-7">
              {temAcesso ? (
                <div className="flex flex-col gap-4">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-km-brand">
                    <Unlock className="size-4" />
                    Você já tem acesso
                  </p>
                  <Link
                    href={`/aluno/curso/${curso.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-md bg-km-brand px-6 py-3.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
                  >
                    Ir para o curso
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    {curso.precoDeCentavos && (
                      <span className="font-mono text-sm text-km-ink-faint line-through">
                        {formatarPreco(curso.precoDeCentavos)}
                      </span>
                    )}
                    <span className="font-display text-3xl font-semibold text-km-ink">
                      {curso.precoCentavos === 0
                        ? "Gratuito"
                        : formatarPreco(curso.precoCentavos)}
                    </span>
                  </div>

                  {/* TODO: trocar por checkout Stripe no Release 2 */}
                  {!session?.user ? (
                    <Link
                      href={`/register?callbackUrl=/cursos/${curso.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-md bg-km-brand px-6 py-3.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
                    >
                      Criar conta
                    </Link>
                  ) : marca.whatsapp ? (
                    <a
                      href={`https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(
                        `Olá! Quero acesso ao curso "${curso.titulo}".`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-md bg-km-brand px-6 py-3.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
                    >
                      Pedir acesso pelo WhatsApp
                    </a>
                  ) : null}

                  <p className="text-center text-xs leading-relaxed text-km-ink-faint">
                    {session?.user
                      ? "A compra online entra em breve. Por enquanto, o acesso é liberado manualmente pela Dra. Karollyne."
                      : "Crie sua conta para acompanhar seus cursos. A compra online entra em breve."}
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* ─── descrição ─── */}
        {curso.descricao && (
          <section className="border-b border-km-line py-14 sm:py-20">
            <div className="mx-auto w-full px-5 sm:px-8">
              <h2 className="font-display text-2xl font-semibold text-km-ink sm:text-3xl">
                Sobre o curso
              </h2>
              <div className="max-w-3xl pt-5 text-km-ink-soft">
                {curso.descricao.split("\n").map((p, i) =>
                  p.trim() ? (
                    <p key={i} className="pb-3 leading-relaxed">
                      {p}
                    </p>
                  ) : null
                )}
              </div>
            </div>
          </section>
        )}

        {/* ─── ementa ─── */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto w-full px-5 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-km-ink sm:text-3xl">
              Conteúdo do curso
            </h2>
            <p className="pt-2 text-sm text-km-ink-soft">
              {curso.modulos.length} módulo{curso.modulos.length === 1 ? "" : "s"} ·{" "}
              {totalAulas} aula{totalAulas === 1 ? "" : "s"}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {curso.modulos.map((modulo, i) => (
                <section
                  key={modulo.id}
                  className="overflow-hidden rounded-xl border border-km-line bg-km-surface"
                >
                  <header className="flex items-baseline gap-3 border-b border-km-line-soft px-5 py-4">
                    <span className="font-mono text-xs text-km-ink-faint tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-lg font-semibold text-km-ink">
                      {modulo.titulo}
                    </h3>
                    <span className="ml-auto font-mono text-xs text-km-ink-faint">
                      {modulo.aulas.length} aula{modulo.aulas.length === 1 ? "" : "s"}
                    </span>
                  </header>

                  {modulo.aulas.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-km-ink-faint">
                      Aulas deste módulo em preparação.
                    </p>
                  ) : (
                    <ul className="divide-y divide-km-line-soft">
                      {modulo.aulas.map((aula) => {
                        const liberada = temAcesso || aula.gratuita

                        const conteudo = (
                          <>
                            {liberada ? (
                              <PlayCircle className="size-4 shrink-0 text-km-brand" />
                            ) : (
                              <Lock className="size-4 shrink-0 text-km-ink-faint" />
                            )}
                            <span
                              className={
                                liberada
                                  ? "flex-1 text-sm text-km-ink"
                                  : "flex-1 text-sm text-km-ink-soft"
                              }
                            >
                              {aula.titulo}
                            </span>
                            {aula.gratuita && !temAcesso && (
                              <span className="font-mono text-[10px] tracking-wider text-km-brand uppercase">
                                amostra
                              </span>
                            )}
                            {aula.duracaoSegundos ? (
                              <span className="font-mono text-[11px] text-km-ink-faint tabular-nums">
                                {formatarDuracao(Math.round(aula.duracaoSegundos / 60))}
                              </span>
                            ) : null}
                          </>
                        )

                        const linha = "flex items-center gap-3 px-5 py-3"

                        // Aula liberada abre a sala de aula. Bloqueada é só
                        // texto — nada de link que não leva a lugar nenhum.
                        return (
                          <li key={aula.id}>
                            {liberada ? (
                              <Link
                                href={`/aluno/curso/${curso.slug}/${aula.slug}`}
                                className={`${linha} transition-colors hover:bg-km-sunk/60`}
                              >
                                {conteudo}
                              </Link>
                            ) : (
                              <div className={linha}>{conteudo}</div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </section>

        {/* ─── perguntas do curso ─── */}
        {curso.faqs.length > 0 && (
          <section className="border-t border-km-line py-14 sm:py-20">
            <div className="mx-auto w-full px-5 sm:px-8">
              <h2 className="font-display text-2xl font-semibold text-km-ink sm:text-3xl">
                Dúvidas sobre este curso
              </h2>
              <dl className="mt-8 flex max-w-3xl flex-col divide-y divide-km-line-soft">
                {curso.faqs.map((f) => (
                  <div key={f.id} className="flex flex-col gap-2 py-5">
                    <dt className="font-medium text-km-ink">{f.pergunta}</dt>
                    <dd className="text-sm leading-relaxed text-km-ink-soft">{f.resposta}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
