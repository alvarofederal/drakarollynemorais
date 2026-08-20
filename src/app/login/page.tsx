import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AuthShell } from "@/app/_components/auth/auth-shell"
import { LoginForm } from "./_components/login-form"

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse seus cursos na plataforma da Dra. Karollyne Morais.",
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) redirect("/apos-login")

  return (
    <AuthShell
      titulo="Entrar na plataforma"
      subtitulo="Acesse seus cursos e continue de onde parou."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-medium text-km-brand hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
