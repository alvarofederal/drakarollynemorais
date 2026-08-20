export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { registerSchema } from "@/lib/validators/auth"
import { checkRateLimit } from "@/lib/rate-limit"

const CUSTO_BCRYPT = 12

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "desconhecido"

    // 5 cadastros por IP por hora — trava criação de contas em massa
    const { allowed } = await checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 1 hora." },
        { status: 429 }
      )
    }

    const validacao = registerSchema.safeParse(await request.json())
    if (!validacao.success) {
      return NextResponse.json(
        { error: validacao.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validacao.data

    const jaExiste = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (jaExiste) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Tente entrar." },
        { status: 409 }
      )
    }

    const senhaHash = await bcrypt.hash(password, CUSTO_BCRYPT)

    // Todo cadastro público nasce ALUNO. Promover a ADMIN é ação manual,
    // feita pelo seed ou pelo painel — nunca por dado vindo do cliente.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: senhaHash,
        role: "ALUNO",
      },
      select: { id: true, email: true, name: true },
    })

    await prisma.logEvento
      .create({ data: { userId: user.id, tipo: "CADASTRO", ip } })
      .catch(() => {
        /* auditoria nunca bloqueia o cadastro */
      })

    return NextResponse.json(
      { success: true, message: "Conta criada com sucesso.", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro no cadastro:", error)
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Tente novamente." },
      { status: 500 }
    )
  }
}
