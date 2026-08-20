import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

/**
 * Despachante pós-login. Lê a sessão no servidor e manda cada papel para a
 * sua área. Existe para o formulário de login não precisar adivinhar o papel
 * antes de o token estar pronto.
 */
export default async function AposLoginPage() {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role === "ADMIN") redirect("/admin")
  redirect("/aluno")
}
