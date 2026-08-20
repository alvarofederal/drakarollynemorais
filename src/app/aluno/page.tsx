import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { listarVitrineDoAluno } from "@/lib/cursos"
import { Wordmark } from "@/app/_components/landing/site-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "@/app/_components/auth/sign-out-button"
import { FileiraCurso } from "./_components/fileira-curso"

export const metadata: Metadata = {
  title: "Meus cursos",
  robots: { index: false, follow: false },
}

export default async function AlunoPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [vitrine, planoComunidade] = await Promise.all([
    listarVitrineDoAluno(session.user.id, session.user.role),
    prisma.plano.findFirst({
      where: { ativo: true },
      orderBy: { criadoEm: "asc" },
      select: { precoCentavos: true },
    }),
  ])

  // Quem já tem acesso vem primeiro: a pessoa entra para estudar, não para comprar
  const ordenada = [...vitrine].sort((a, b) => Number(b.temAcesso) - Number(a.temAcesso))
  const comAcesso = vitrine.filter((v) => v.temAcesso).length

  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <header className="sticky top-0 z-40 border-b border-km-line bg-km-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 sm:px-8">
          <Wordmark />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.14em] text-km-brand uppercase">
            Área do aluno
          </p>
          <h1 className="pt-2 font-display text-3xl font-semibold tracking-tight text-km-ink sm:text-4xl">
            Olá, {session.user.name?.split(" ")[0] ?? "tudo certo"}.
          </h1>
          <p className="pt-1.5 text-sm text-km-ink-soft">
            {vitrine.length === 0
              ? "Nenhum curso publicado ainda."
              : comAcesso > 0
                ? `${comAcesso} curso${comAcesso > 1 ? "s" : ""} liberado${comAcesso > 1 ? "s" : ""} para você. A primeira aula de cada curso é sempre gratuita.`
                : "A primeira aula de cada curso é gratuita. Assista e veja se é para você."}
          </p>
        </div>

        {vitrine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-km-line bg-km-surface p-12 text-center">
            <h2 className="font-display text-2xl font-semibold text-km-ink">
              Os cursos estão sendo preparados
            </h2>
            <p className="mx-auto mt-3 max-w-md text-km-ink-soft">
              Assim que o primeiro for publicado, ele aparece aqui com a aula de
              abertura já liberada para você.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {ordenada.map((item) => (
              <FileiraCurso
                key={item.curso.id}
                curso={item.curso}
                aulas={item.aulas}
                temAcesso={item.temAcesso}
                motivo={item.motivo}
                percentual={item.percentual}
                expiraEm={item.expiraEm}
                precoComunidadeCentavos={planoComunidade?.precoCentavos ?? null}
              />
            ))}
          </div>
        )}

        {session.user.role === "ADMIN" && (
          <p className="pt-2 text-sm text-km-ink-soft">
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
