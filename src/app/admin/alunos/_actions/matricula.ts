"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { exigirAdmin } from "@/lib/acesso"

type Resultado = { ok: true } | { ok: false; error: string }

function revalidar(userId: string) {
  revalidatePath("/admin/alunos")
  revalidatePath(`/admin/alunos/${userId}`)
  revalidatePath("/aluno")
}

/**
 * Libera o acesso de um aluno a um curso, sem passar por pagamento.
 *
 * É o que a Dra. usa para turma presencial, cortesia, parceria — e para
 * resolver na hora quando um pagamento falha e o aluno fica sem acesso.
 */
export async function concederMatricula(userId: string, cursoId: string): Promise<Resultado> {
  await exigirAdmin()

  const [aluno, curso] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }),
    prisma.curso.findUnique({
      where: { id: cursoId },
      select: { id: true, tipoAcesso: true, acessoDias: true },
    }),
  ])

  if (!aluno) return { ok: false, error: "Aluno não encontrado" }
  if (!curso) return { ok: false, error: "Curso não encontrado" }

  // O prazo é calculado a partir da regra do curso, não digitado à mão
  const expiraEm =
    curso.tipoAcesso === "PRAZO_DIAS" && curso.acessoDias
      ? new Date(Date.now() + curso.acessoDias * 24 * 60 * 60 * 1000)
      : null

  const existente = await prisma.matricula.findUnique({
    where: { userId_cursoId: { userId, cursoId } },
    select: { id: true, status: true },
  })

  if (existente) {
    // Reativa em vez de duplicar — a chave única não permitiria duas mesmo
    if (existente.status === "ATIVA") {
      return { ok: false, error: "Este aluno já tem acesso a este curso." }
    }
    await prisma.matricula.update({
      where: { id: existente.id },
      data: { status: "ATIVA", expiraEm, origem: "CORTESIA" },
    })
  } else {
    await prisma.matricula.create({
      data: { userId, cursoId, origem: "CORTESIA", status: "ATIVA", expiraEm },
    })
  }

  await prisma.logEvento
    .create({
      data: {
        userId,
        tipo: "MATRICULA_CRIADA",
        entidade: "Curso",
        entidadeId: cursoId,
        metadata: { origem: "CORTESIA" },
      },
    })
    .catch(() => {})

  revalidar(userId)
  return { ok: true }
}

/**
 * Revoga o acesso. O progresso e o certificado emitido NÃO são apagados —
 * só o acesso some. Ver `context/rules.md`.
 */
export async function revogarMatricula(matriculaId: string): Promise<Resultado> {
  await exigirAdmin()

  const matricula = await prisma.matricula.findUnique({
    where: { id: matriculaId },
    select: { id: true, userId: true, cursoId: true, status: true },
  })
  if (!matricula) return { ok: false, error: "Matrícula não encontrada" }
  if (matricula.status !== "ATIVA") return { ok: false, error: "Esta matrícula já está inativa." }

  await prisma.matricula.update({
    where: { id: matriculaId },
    data: { status: "CANCELADA" },
  })

  await prisma.logEvento
    .create({
      data: {
        userId: matricula.userId,
        tipo: "MATRICULA_REVOGADA",
        entidade: "Curso",
        entidadeId: matricula.cursoId,
      },
    })
    .catch(() => {})

  revalidar(matricula.userId)
  return { ok: true }
}

/** Liga ou desliga a conta do aluno por completo. */
export async function alternarAtivoDoAluno(userId: string): Promise<Resultado> {
  await exigirAdmin()

  const aluno = await prisma.user.findUnique({
    where: { id: userId },
    select: { ativo: true, role: true },
  })
  if (!aluno) return { ok: false, error: "Aluno não encontrado" }
  if (aluno.role === "ADMIN") {
    return { ok: false, error: "Não é possível desativar uma conta de administradora." }
  }

  await prisma.user.update({ where: { id: userId }, data: { ativo: !aluno.ativo } })

  revalidar(userId)
  return { ok: true }
}
