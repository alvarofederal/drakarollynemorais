"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { exigirSessao, verificarAcesso } from "@/lib/acesso"

type Resultado = { ok: true; data?: { percentual: number } } | { ok: false; error: string }

/**
 * Marca ou desmarca uma aula como concluída e recalcula o percentual do curso.
 *
 * O percentual sai da contagem de aulas publicadas — não de um contador
 * incremental, que sairia do lugar assim que uma aula fosse publicada ou
 * despublicada.
 */
export async function alternarConclusaoDaAula(aulaId: string): Promise<Resultado> {
  const session = await exigirSessao()

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    select: {
      id: true,
      publicada: true,
      modulo: { select: { cursoId: true, curso: { select: { slug: true } } } },
    },
  })
  if (!aula) return { ok: false, error: "Aula não encontrada" }
  if (!aula.publicada) return { ok: false, error: "Esta aula ainda não está publicada." }

  const cursoId = aula.modulo.cursoId

  const liberado = await verificarAcesso(session.user.id, cursoId, session.user.role)
  if (!liberado) return { ok: false, error: "Você não tem acesso a este curso." }

  const matricula = await prisma.matricula.findUnique({
    where: { userId_cursoId: { userId: session.user.id, cursoId } },
    select: { id: true },
  })

  // A ADMIN pode assistir sem matrícula (pré-visualização). Nesse caso não há
  // o que registrar: progresso pertence a aluno matriculado.
  if (!matricula) {
    return { ok: false, error: "Pré-visualização não registra progresso." }
  }

  const atual = await prisma.progressoAula.findUnique({
    where: { userId_aulaId: { userId: session.user.id, aulaId } },
    select: { id: true, concluida: true },
  })

  const concluida = !atual?.concluida

  await prisma.progressoAula.upsert({
    where: { userId_aulaId: { userId: session.user.id, aulaId } },
    create: {
      userId: session.user.id,
      aulaId,
      matriculaId: matricula.id,
      concluida,
      concluidaEm: concluida ? new Date() : null,
    },
    update: { concluida, concluidaEm: concluida ? new Date() : null },
  })

  const [total, feitas] = await Promise.all([
    prisma.aula.count({ where: { modulo: { cursoId }, publicada: true } }),
    prisma.progressoAula.count({
      where: {
        userId: session.user.id,
        concluida: true,
        aula: { modulo: { cursoId }, publicada: true },
      },
    }),
  ])

  const percentual = total === 0 ? 0 : Math.round((feitas / total) * 100)

  await prisma.matricula.update({
    where: { id: matricula.id },
    data: {
      percentualConcluido: percentual,
      concluidaEm: percentual >= 100 ? new Date() : null,
    },
  })

  revalidatePath(`/aluno/curso/${aula.modulo.curso.slug}`, "layout")
  revalidatePath("/aluno")

  return { ok: true, data: { percentual } }
}

/** Guarda onde o aluno parou, para retomar depois. */
export async function salvarPosicao(aulaId: string, segundos: number): Promise<Resultado> {
  const session = await exigirSessao()

  const posicao = Math.max(0, Math.floor(segundos))

  const progresso = await prisma.progressoAula.findUnique({
    where: { userId_aulaId: { userId: session.user.id, aulaId } },
    select: { id: true },
  })

  // Sem registro prévio significa que a aula ainda não foi aberta por um aluno
  // matriculado — nada a guardar.
  if (!progresso) return { ok: true }

  await prisma.progressoAula.update({
    where: { id: progresso.id },
    data: { ultimaPosicao: posicao, segundosAssistidos: { increment: 0 } },
  })

  return { ok: true }
}
