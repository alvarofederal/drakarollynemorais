export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { exigirAdmin } from "@/lib/acesso"
import { criarUploadDireto, excluirVideo } from "@/lib/stream"

const schema = z.object({ aulaId: z.string().min(1) })

/**
 * Devolve uma URL de upload de uso único para o navegador enviar o vídeo
 * DIRETO ao Cloudflare. O arquivo nunca passa por aqui — é o que permite
 * subir 2 GB sem esbarrar no limite de corpo de requisição da Vercel.
 */
export async function POST(request: NextRequest) {
  await exigirAdmin()

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Aula não informada" }, { status: 400 })
  }

  const aula = await prisma.aula.findUnique({
    where: { id: parsed.data.aulaId },
    select: {
      id: true,
      titulo: true,
      videoUid: true,
      modulo: { select: { cursoId: true, curso: { select: { titulo: true } } } },
    },
  })

  if (!aula) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
  }

  try {
    const anterior = aula.videoUid

    const { uploadURL, uid } = await criarUploadDireto({
      maxDuracaoSegundos: 4 * 60 * 60,
      meta: {
        aulaId: aula.id,
        cursoId: aula.modulo.cursoId,
        titulo: aula.titulo.slice(0, 80),
        curso: aula.modulo.curso.titulo.slice(0, 80),
      },
    })

    // Aponta a aula para o vídeo novo antes do envio começar: se o upload
    // falhar no meio, sobra um vídeo pendente no Cloudflare, não um registro
    // apontando para lugar nenhum.
    await prisma.aula.update({
      where: { id: aula.id },
      data: { videoUid: uid, videoPronto: false, duracaoSegundos: null },
    })

    // Substituição: o vídeo antigo sai, para não pagar armazenamento por lixo
    if (anterior && anterior !== uid) {
      await excluirVideo(anterior).catch((e) =>
        console.error("Falha ao remover vídeo anterior:", e)
      )
    }

    return NextResponse.json({ uploadURL, uid })
  } catch (erro) {
    console.error("Erro ao criar upload no Stream:", erro)
    return NextResponse.json(
      { error: erro instanceof Error ? erro.message : "Falha ao preparar o upload" },
      { status: 502 }
    )
  }
}
