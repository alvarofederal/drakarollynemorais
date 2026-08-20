import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AuthShell } from "@/app/_components/auth/auth-shell"
import { RegisterForm } from "./_components/register-form"

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta e comece a estudar.",
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const session = await auth()
  if (session?.user) redirect("/apos-login")

  return (
    <AuthShell
      titulo="Criar sua conta"
      subtitulo="Leva menos de um minuto."
      rodape={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-km-brand hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
