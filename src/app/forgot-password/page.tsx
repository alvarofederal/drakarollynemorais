import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/app/_components/auth/auth-shell"

export const metadata: Metadata = {
  title: "Recuperar senha",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      titulo="Recuperar senha"
      subtitulo="Ainda estamos construindo esta parte."
      rodape={
        <>
          Lembrou a senha?{" "}
          <Link href="/login" className="font-medium text-km-brand hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-km-ink-soft">
          A redefinição de senha por e-mail entra junto com os e-mails transacionais, no
          Release 2. Até lá, se você perdeu o acesso, fale com a gente pelo canal de contato
          e sua senha é redefinida manualmente.
        </p>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-md border border-km-line bg-km-bg px-4 py-3 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
        >
          Voltar para o login
        </Link>
      </div>
    </AuthShell>
  )
}
