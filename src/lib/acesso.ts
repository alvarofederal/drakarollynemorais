import { redirect } from "next/navigation"
import type { Session } from "next-auth"
import { auth } from "./auth"
import prisma from "./prisma"

/**
 * Ponto único de verificação de acesso.
 *
 * Nenhuma rota implementa a própria checagem — se cada tela escrever a sua,
 * uma delas vai esquecer de conferir expiração ou reembolso. Toda decisão de
 * acesso a conteúdo passa por aqui.
 *
 * Ver `context/rules.md` → Regras de negócio invioláveis.
 */

// `auth` é sobrecarregado (também serve de middleware), então derivar o tipo do
// retorno dele pega a assinatura errada. O tipo bom vem direto do next-auth.
export type Sessao = Session

/** Exige apenas que exista alguém logado. */
export async function exigirSessao(): Promise<Sessao> {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

/** Exige o papel ADMIN. Aluno que tentar entrar vai para a área dele. */
export async function exigirAdmin(): Promise<Sessao> {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/aluno")
  return session
}

/**
 * O aluno tem acesso ao curso?
 *
 * Verdadeiro só quando existe matrícula ATIVA e dentro do prazo.
 * ADMIN enxerga tudo — ela precisa pré-visualizar o que publica.
 */
export async function verificarAcesso(
  userId: string,
  cursoId: string,
  papel?: string
): Promise<boolean> {
  if (papel === "ADMIN") return true

  const matricula = await prisma.matricula.findUnique({
    where: { userId_cursoId: { userId, cursoId } },
    select: { status: true, expiraEm: true },
  })

  if (!matricula) return false
  if (matricula.status !== "ATIVA") return false
  // expiraEm nulo = acesso vitalício
  if (matricula.expiraEm && matricula.expiraEm <= new Date()) return false

  return true
}

/**
 * Igual a `verificarAcesso`, mas redireciona em vez de devolver falso.
 * Use nas páginas da sala de aula.
 */
export async function exigirAcesso(cursoId: string, slugDoCurso: string) {
  const session = await exigirSessao()
  const liberado = await verificarAcesso(session.user.id, cursoId, session.user.role)
  if (!liberado) redirect(`/cursos/${slugDoCurso}`)
  return session
}

/**
 * Uma aula é visível sem matrícula? Só se estiver marcada como amostra
 * gratuita E publicada. É a única exceção ao portão de matrícula.
 */
export function ehAmostraLiberada(aula: { gratuita: boolean; publicada: boolean }) {
  return aula.gratuita && aula.publicada
}
