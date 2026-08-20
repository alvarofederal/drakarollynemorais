"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { exigirAdmin } from "@/lib/acesso"
import { gerarSlug } from "@/lib/slug"
import { aulaSchema, moduloSchema } from "@/lib/validators/curso"
import { excluirVideo, obterVideo } from "@/lib/stream"

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

function revalidarCurso(cursoId: string) {
  revalidatePath(`/admin/cursos/${cursoId}`)
}

/* ─── módulos ─────────────────────────────────────────────────── */

export async function criarModulo(entrada: unknown): Promise<Resultado> {
  await exigirAdmin()

  const parsed = moduloSchema.safeParse(entrada)
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message }

  const { cursoId, titulo, descricao } = parsed.data

  const ultimo = await prisma.modulo.findFirst({
    where: { cursoId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  })

  await prisma.modulo.create({
    data: { cursoId, titulo, descricao: descricao || null, ordem: (ultimo?.ordem ?? -1) + 1 },
  })

  revalidarCurso(cursoId)
  return { ok: true }
}

export async function renomearModulo(id: string, titulo: string): Promise<Resultado> {
  await exigirAdmin()

  const limpo = titulo.trim()
  if (limpo.length < 2) return { ok: false, error: "Informe o título do módulo" }

  const modulo = await prisma.modulo.update({
    where: { id },
    data: { titulo: limpo },
    select: { cursoId: true },
  })

  revalidarCurso(modulo.cursoId)
  return { ok: true }
}

export async function excluirModulo(id: string): Promise<Resultado> {
  await exigirAdmin()

  const modulo = await prisma.modulo.findUnique({
    where: { id },
    select: { cursoId: true, _count: { select: { aulas: true } } },
  })
  if (!modulo) return { ok: false, error: "Módulo não encontrado" }

  if (modulo._count.aulas > 0) {
    return {
      ok: false,
      error: `Este módulo tem ${modulo._count.aulas} aula(s). Remova as aulas antes de excluir.`,
    }
  }

  await prisma.modulo.delete({ where: { id } })
  revalidarCurso(modulo.cursoId)
  return { ok: true }
}

/* ─── aulas ───────────────────────────────────────────────────── */

export async function criarAula(entrada: unknown): Promise<Resultado> {
  await exigirAdmin()

  const parsed = aulaSchema.safeParse(entrada)
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message }

  const { moduloId, titulo, descricao, tipo, gratuita } = parsed.data

  const modulo = await prisma.modulo.findUnique({
    where: { id: moduloId },
    select: { cursoId: true },
  })
  if (!modulo) return { ok: false, error: "Módulo não encontrado" }

  const ultima = await prisma.aula.findFirst({
    where: { moduloId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  })

  // slug é único por módulo (@@unique([moduloId, slug]))
  const base = gerarSlug(titulo) || "aula"
  let slug = base
  for (let i = 2; await prisma.aula.findFirst({ where: { moduloId, slug }, select: { id: true } }); i++) {
    slug = `${base}-${i}`
  }

  await prisma.aula.create({
    data: {
      moduloId,
      slug,
      titulo,
      descricao: descricao || null,
      tipo,
      gratuita,
      ordem: (ultima?.ordem ?? -1) + 1,
      publicada: false,
    },
  })

  revalidarCurso(modulo.cursoId)
  return { ok: true }
}

export async function atualizarAula(id: string, entrada: unknown): Promise<Resultado> {
  await exigirAdmin()

  const parsed = aulaSchema.safeParse(entrada)
  if (!parsed.success) return { ok: false, error: parsed.error.errors[0].message }

  const { titulo, descricao, tipo, gratuita } = parsed.data

  const aula = await prisma.aula.update({
    where: { id },
    data: { titulo, descricao: descricao || null, tipo, gratuita },
    select: { modulo: { select: { cursoId: true } } },
  })

  revalidarCurso(aula.modulo.cursoId)
  return { ok: true }
}

export async function alternarPublicacaoAula(id: string): Promise<Resultado> {
  const session = await exigirAdmin()

  const aula = await prisma.aula.findUnique({
    where: { id },
    select: { publicada: true, tipo: true, videoPronto: true, modulo: { select: { cursoId: true } } },
  })
  if (!aula) return { ok: false, error: "Aula não encontrada" }

  // Aula de vídeo sem vídeo pronto não pode ir ao ar — o aluno veria um player vazio
  if (!aula.publicada && aula.tipo === "VIDEO" && !aula.videoPronto) {
    return { ok: false, error: "Envie o vídeo antes de publicar esta aula." }
  }

  await prisma.aula.update({ where: { id }, data: { publicada: !aula.publicada } })

  if (!aula.publicada) {
    await prisma.logEvento
      .create({
        data: {
          userId: session.user.id,
          tipo: "AULA_PUBLICADA",
          entidade: "Aula",
          entidadeId: id,
        },
      })
      .catch(() => {})
  }

  revalidarCurso(aula.modulo.cursoId)
  return { ok: true }
}

export async function excluirAula(id: string): Promise<Resultado> {
  await exigirAdmin()

  const aula = await prisma.aula.findUnique({
    where: { id },
    select: { modulo: { select: { cursoId: true } }, _count: { select: { progressos: true } } },
  })
  if (!aula) return { ok: false, error: "Aula não encontrada" }

  if (aula._count.progressos > 0) {
    return {
      ok: false,
      error: "Alunos já assistiram esta aula. Despublique em vez de excluir.",
    }
  }

  await prisma.$transaction([
    prisma.material.deleteMany({ where: { aulaId: id } }),
    prisma.aula.delete({ where: { id } }),
  ])

  revalidarCurso(aula.modulo.cursoId)
  return { ok: true }
}

/* ─── reordenação ─────────────────────────────────────────────── */

/**
 * Troca de posição com o vizinho. Simples e previsível — sem arrastar,
 * que exigiria uma biblioteca de drag-and-drop só para isto.
 */
export async function moverModulo(id: string, direcao: "cima" | "baixo"): Promise<Resultado> {
  await exigirAdmin()

  const atual = await prisma.modulo.findUnique({
    where: { id },
    select: { id: true, ordem: true, cursoId: true },
  })
  if (!atual) return { ok: false, error: "Módulo não encontrado" }

  const vizinho = await prisma.modulo.findFirst({
    where: {
      cursoId: atual.cursoId,
      ordem: direcao === "cima" ? { lt: atual.ordem } : { gt: atual.ordem },
    },
    orderBy: { ordem: direcao === "cima" ? "desc" : "asc" },
    select: { id: true, ordem: true },
  })
  if (!vizinho) return { ok: true } // já está na ponta

  await prisma.$transaction([
    prisma.modulo.update({ where: { id: atual.id }, data: { ordem: vizinho.ordem } }),
    prisma.modulo.update({ where: { id: vizinho.id }, data: { ordem: atual.ordem } }),
  ])

  revalidarCurso(atual.cursoId)
  return { ok: true }
}

export async function moverAula(id: string, direcao: "cima" | "baixo"): Promise<Resultado> {
  await exigirAdmin()

  const atual = await prisma.aula.findUnique({
    where: { id },
    select: { id: true, ordem: true, moduloId: true, modulo: { select: { cursoId: true } } },
  })
  if (!atual) return { ok: false, error: "Aula não encontrada" }

  const vizinha = await prisma.aula.findFirst({
    where: {
      moduloId: atual.moduloId,
      ordem: direcao === "cima" ? { lt: atual.ordem } : { gt: atual.ordem },
    },
    orderBy: { ordem: direcao === "cima" ? "desc" : "asc" },
    select: { id: true, ordem: true },
  })
  if (!vizinha) return { ok: true }

  await prisma.$transaction([
    prisma.aula.update({ where: { id: atual.id }, data: { ordem: vizinha.ordem } }),
    prisma.aula.update({ where: { id: vizinha.id }, data: { ordem: atual.ordem } }),
  ])

  revalidarCurso(atual.modulo.cursoId)
  return { ok: true }
}

/* ─── vídeo ───────────────────────────────────────────────────── */

/**
 * O Cloudflare devolve o motivo da falha em inglês. Quem vai ler é a Dra.,
 * não um desenvolvedor — então traduzimos os casos conhecidos e damos uma
 * saída em português para o resto.
 */
function traduzirErroDeVideo(motivo?: string): string {
  if (!motivo) return "O Cloudflare não conseguiu processar este arquivo."

  const original = motivo.toLowerCase()

  if (original.includes("not recognized as a valid video")) {
    return "Este arquivo não é um vídeo válido. Verifique se abriu corretamente no seu computador antes de enviar."
  }
  if (original.includes("duration") || original.includes("too long")) {
    return "O vídeo é mais longo que o limite aceito (4 horas). Divida em partes menores."
  }
  if (original.includes("no audio") || original.includes("no video track")) {
    return "O arquivo não tem faixa de vídeo utilizável."
  }
  if (original.includes("size") || original.includes("too large")) {
    return "O arquivo é grande demais. Comprima antes de enviar."
  }

  return `O Cloudflare não conseguiu processar este vídeo (${motivo})`
}

/**
 * Consulta o Cloudflare e atualiza o estado do vídeo da aula.
 *
 * Existe porque o webhook do Stream não alcança `localhost`. Em produção o
 * webhook faz o mesmo trabalho; aqui o painel pergunta enquanto espera.
 */
export async function sincronizarVideoDaAula(aulaId: string): Promise<
  { ok: true; data: { pronto: boolean; estado: string; pct: string | null } } | { ok: false; error: string }
> {
  await exigirAdmin()

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    select: { videoUid: true, modulo: { select: { cursoId: true } } },
  })

  if (!aula?.videoUid) return { ok: false, error: "Esta aula ainda não tem vídeo." }

  try {
    const video = await obterVideo(aula.videoUid)

    // O Cloudflare desistiu de codificar. Avisa na hora em vez de deixar o
    // painel consultando por cinco minutos até desistir sozinho.
    if (video.status?.state === "error") {
      const motivo = traduzirErroDeVideo(video.status.errorReasonText)

      // Não guardamos vídeo quebrado: ocupa armazenamento e confunde a tela
      await excluirVideo(aula.videoUid).catch(() => {})
      await prisma.aula.update({
        where: { id: aulaId },
        data: { videoUid: null, videoPronto: false, duracaoSegundos: null, publicada: false },
      })
      revalidarCurso(aula.modulo.cursoId)

      return { ok: false, error: motivo }
    }

    const pronto = video.readyToStream === true

    if (pronto) {
      await prisma.aula.update({
        where: { id: aulaId },
        data: {
          videoPronto: true,
          duracaoSegundos: video.duration ? Math.round(video.duration) : null,
        },
      })
      revalidarCurso(aula.modulo.cursoId)
    }

    return {
      ok: true,
      data: {
        pronto,
        estado: video.status?.state ?? "desconhecido",
        pct: video.status?.pctComplete ?? null,
      },
    }
  } catch (erro) {
    return {
      ok: false,
      error: erro instanceof Error ? erro.message : "Falha ao consultar o Cloudflare",
    }
  }
}

/** Remove o vídeo da aula, no Cloudflare e no banco. Despublica a aula. */
export async function removerVideoDaAula(aulaId: string): Promise<Resultado> {
  await exigirAdmin()

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    select: { videoUid: true, modulo: { select: { cursoId: true } } },
  })
  if (!aula) return { ok: false, error: "Aula não encontrada" }

  if (aula.videoUid) {
    await excluirVideo(aula.videoUid).catch((e) =>
      console.error("Falha ao remover vídeo no Cloudflare:", e)
    )
  }

  await prisma.aula.update({
    where: { id: aulaId },
    // Aula de vídeo sem vídeo não pode ficar publicada
    data: { videoUid: null, videoPronto: false, duracaoSegundos: null, publicada: false },
  })

  revalidarCurso(aula.modulo.cursoId)
  return { ok: true }
}
