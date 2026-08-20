"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { exigirAdmin } from "@/lib/acesso"
import { gerarSlugUnico } from "@/lib/slug"
import { cursoSchema } from "@/lib/validators/curso"

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

async function slugOcupado(slug: string, ignorarId?: string) {
  const existente = await prisma.curso.findUnique({ where: { slug }, select: { id: true } })
  return !!existente && existente.id !== ignorarId
}

export async function criarCurso(entrada: unknown): Promise<Resultado<{ id: string }>> {
  await exigirAdmin()

  const parsed = cursoSchema.safeParse(entrada)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0].message }
  }

  const d = parsed.data
  const slug = await gerarSlugUnico(d.titulo, (s) => slugOcupado(s))

  const curso = await prisma.curso.create({
    data: {
      slug,
      titulo: d.titulo,
      subtitulo: d.subtitulo || null,
      descricao: d.descricao || null,
      nivel: d.nivel,
      cargaHorariaMinutos: d.cargaHorariaMinutos,
      precoCentavos: d.precoCentavos,
      precoDeCentavos: d.precoDeCentavos || null,
      tipoAcesso: d.tipoAcesso,
      acessoDias: d.tipoAcesso === "PRAZO_DIAS" ? d.acessoDias : null,
      emiteCertificado: d.emiteCertificado,
      percentualParaCertificado: d.percentualParaCertificado,
      // nasce sempre como RASCUNHO — publicar é uma ação explícita
      status: "RASCUNHO",
    },
    select: { id: true },
  })

  revalidatePath("/admin/cursos")
  return { ok: true, data: { id: curso.id } }
}

export async function atualizarCurso(id: string, entrada: unknown): Promise<Resultado> {
  await exigirAdmin()

  const parsed = cursoSchema.safeParse(entrada)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0].message }
  }

  const atual = await prisma.curso.findUnique({ where: { id }, select: { titulo: true, slug: true } })
  if (!atual) return { ok: false, error: "Curso não encontrado" }

  const d = parsed.data

  // O slug só muda se o título mudou — links já divulgados não podem quebrar à toa
  const slug =
    atual.titulo === d.titulo
      ? atual.slug
      : await gerarSlugUnico(d.titulo, (s) => slugOcupado(s, id))

  await prisma.curso.update({
    where: { id },
    data: {
      slug,
      titulo: d.titulo,
      subtitulo: d.subtitulo || null,
      descricao: d.descricao || null,
      nivel: d.nivel,
      cargaHorariaMinutos: d.cargaHorariaMinutos,
      precoCentavos: d.precoCentavos,
      precoDeCentavos: d.precoDeCentavos || null,
      tipoAcesso: d.tipoAcesso,
      acessoDias: d.tipoAcesso === "PRAZO_DIAS" ? d.acessoDias : null,
      emiteCertificado: d.emiteCertificado,
      percentualParaCertificado: d.percentualParaCertificado,
    },
  })

  revalidatePath("/admin/cursos")
  revalidatePath(`/admin/cursos/${id}`)
  return { ok: true }
}

export async function publicarCurso(id: string): Promise<Resultado> {
  const session = await exigirAdmin()

  const curso = await prisma.curso.findUnique({
    where: { id },
    select: {
      status: true,
      modulos: { select: { aulas: { where: { publicada: true }, select: { id: true } } } },
    },
  })
  if (!curso) return { ok: false, error: "Curso não encontrado" }

  const aulasPublicadas = curso.modulos.reduce((t, m) => t + m.aulas.length, 0)
  if (aulasPublicadas === 0) {
    return {
      ok: false,
      error: "Publique pelo menos uma aula antes de publicar o curso.",
    }
  }

  await prisma.$transaction([
    prisma.curso.update({
      where: { id },
      data: { status: "PUBLICADO", publicadoEm: new Date() },
    }),
    prisma.logEvento.create({
      data: {
        userId: session.user.id,
        tipo: "CURSO_PUBLICADO",
        entidade: "Curso",
        entidadeId: id,
      },
    }),
  ])

  revalidatePath("/admin/cursos")
  revalidatePath(`/admin/cursos/${id}`)
  return { ok: true }
}

export async function despublicarCurso(id: string): Promise<Resultado> {
  await exigirAdmin()
  await prisma.curso.update({ where: { id }, data: { status: "RASCUNHO" } })
  revalidatePath("/admin/cursos")
  revalidatePath(`/admin/cursos/${id}`)
  return { ok: true }
}

export async function arquivarCurso(id: string): Promise<Resultado> {
  await exigirAdmin()
  // Arquivar tira do catálogo mas NÃO tira o acesso de quem já comprou
  await prisma.curso.update({ where: { id }, data: { status: "ARQUIVADO" } })
  revalidatePath("/admin/cursos")
  revalidatePath(`/admin/cursos/${id}`)
  return { ok: true }
}

export async function excluirCurso(id: string): Promise<Resultado> {
  await exigirAdmin()

  const matriculas = await prisma.matricula.count({ where: { cursoId: id } })
  if (matriculas > 0) {
    return {
      ok: false,
      error:
        `Este curso tem ${matriculas} matrícula(s). Excluir apagaria o histórico dos alunos — arquive em vez de excluir.`,
    }
  }

  // Sem foreign keys no banco (relationMode = "prisma"): a cascata é nossa
  await prisma.$transaction([
    prisma.material.deleteMany({ where: { OR: [{ cursoId: id }, { aula: { modulo: { cursoId: id } } }] } }),
    prisma.aula.deleteMany({ where: { modulo: { cursoId: id } } }),
    prisma.modulo.deleteMany({ where: { cursoId: id } }),
    prisma.depoimento.deleteMany({ where: { cursoId: id } }),
    prisma.faq.deleteMany({ where: { cursoId: id } }),
    prisma.curso.delete({ where: { id } }),
  ])

  revalidatePath("/admin/cursos")
  return { ok: true }
}
