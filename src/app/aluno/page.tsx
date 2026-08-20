import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
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

  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <header className="border-b border-km-line">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
          <Wordmark />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8">
        <p className="font-mono text-xs tracking-[0.14em] text-km-brand uppercase">
          Área do aluno
        </p>
        <h1 className="pt-3 font-display text-3xl font-semibold tracking-tight text-km-ink sm:text-4xl">
          Olá, {session.user.name ?? "tudo certo"}.
        </h1>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-km-line py-5 font-mono text-xs">
          <div className="flex flex-col gap-1">
            <dt className="tracking-wide text-km-ink-faint uppercase">E-mail</dt>
            <dd className="text-km-ink">{session.user.email}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="tracking-wide text-km-ink-faint uppercase">Papel</dt>
            <dd className="text-km-ink">{session.user.role}</dd>
          </div>
        </dl>

        <div className="mt-10 rounded-xl border border-dashed border-km-line bg-km-surface p-10 text-center sm:p-14">
          <h2 className="font-display text-2xl font-semibold text-km-ink">
            Sua sala de aula está sendo construída
          </h2>
          <p className="mx-auto mt-3 max-w-md text-km-ink-soft">
            Em breve seus cursos, o player das aulas e os materiais para baixar aparecem
            aqui. Por enquanto, sua conta já está criada e o acesso funcionando.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center justify-center rounded-md border border-km-line px-6 py-3 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
          >
            Ver os cursos disponíveis
          </Link>
        </div>

        {session.user.role === "ADMIN" && (
          <p className="pt-6 text-center text-sm text-km-ink-soft">
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
