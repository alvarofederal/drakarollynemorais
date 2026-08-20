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

/** Por que a pessoa tem (ou não tem) acesso. A UI usa isso para explicar. */
export type MotivoDeAcesso =
  | "ADMIN"
  | "ASSINATURA"
  | "COMPRA"
  | "SEM_ACESSO"

/**
 * A assinatura da comunidade está valendo?
 *
 * Vale enquanto `ATIVA` e dentro do período pago. Quem cancelou continua com
 * acesso até `acessoAte` — ele já pagou por aquele mês.
 * `INADIMPLENTE` também passa: é a tolerância para cartão recusado, que
 * acontece o tempo todo e não deve cortar o acesso na hora.
 */
export async function temAssinaturaAtiva(userId: string): Promise<boolean> {
  const agora = new Date()

  const assinatura = await prisma.assinatura.findFirst({
    where: {
      userId,
      status: { in: ["ATIVA", "INADIMPLENTE"] },
      OR: [{ renovaEm: { gt: agora } }, { acessoAte: { gt: agora } }],
    },
    select: { id: true },
  })

  return !!assinatura
}

/**
 * A pessoa tem acesso a este curso — e por quê.
 *
 * São duas portas, e basta uma:
 *   1. assinatura ativa da comunidade → todos os cursos
 *   2. matrícula ativa e dentro do prazo → aquele curso
 *
 * ADMIN enxerga tudo, porque precisa pré-visualizar o que publica.
 */
export async function motivoDeAcesso(
  userId: string,
  cursoId: string,
  papel?: string
): Promise<MotivoDeAcesso> {
  if (papel === "ADMIN") return "ADMIN"

  if (await temAssinaturaAtiva(userId)) return "ASSINATURA"

  const matricula = await prisma.matricula.findUnique({
    where: { userId_cursoId: { userId, cursoId } },
    select: { status: true, expiraEm: true },
  })

  if (!matricula) return "SEM_ACESSO"
  if (matricula.status !== "ATIVA") return "SEM_ACESSO"
  // expiraEm nulo = acesso vitalício
  if (matricula.expiraEm && matricula.expiraEm <= new Date()) return "SEM_ACESSO"

  return "COMPRA"
}

/** Versão booleana, para quando o motivo não importa. */
export async function verificarAcesso(
  userId: string,
  cursoId: string,
  papel?: string
): Promise<boolean> {
  return (await motivoDeAcesso(userId, cursoId, papel)) !== "SEM_ACESSO"
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
