import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatarPreco } from "@/lib/formato"

export const metadata: Metadata = {
  title: "Visão geral",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const session = await auth()

  const [alunos, cursosPublicados, cursosRascunho, matriculas, faturamento] =
    await Promise.all([
      prisma.user.count({ where: { role: "ALUNO" } }),
      prisma.curso.count({ where: { status: "PUBLICADO" } }),
      prisma.curso.count({ where: { status: "RASCUNHO" } }),
      prisma.matricula.count({ where: { status: "ATIVA" } }),
      prisma.pedido.aggregate({
        where: { status: "PAGO" },
        _sum: { valorCentavos: true },
      }),
    ])

  const metricas = [
    { rotulo: "Alunos cadastrados", valor: String(alunos), icone: Users },
    { rotulo: "Cursos publicados", valor: String(cursosPublicados), icone: BookOpen },
    { rotulo: "Matrículas ativas", valor: String(matriculas), icone: GraduationCap },
    {
      rotulo: "Faturamento total",
      valor: formatarPreco(faturamento._sum.valorCentavos ?? 0),
      icone: null,
    },
  ]

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="font-mono text-xs tracking-[0.14em] text-km-brand uppercase">
          Painel da administradora
        </p>
        <h1 className="pt-3 font-display text-3xl font-semibold tracking-tight text-km-ink sm:text-4xl">
          Olá, {session?.user?.name ?? "Dra. Karollyne"}.
        </h1>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-xl border border-km-line bg-km-line sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map((m) => (
          <div key={m.rotulo} className="flex flex-col gap-1 bg-km-surface p-6">
            <dd className="font-display text-3xl font-semibold text-km-brand tabular-nums">
              {m.valor}
            </dd>
            <dt className="text-sm text-km-ink-soft">{m.rotulo}</dt>
          </div>
        ))}
      </dl>

      {cursosPublicados === 0 && (
        <div className="rounded-xl border border-dashed border-km-line bg-km-surface p-10 text-center sm:p-14">
          <h2 className="font-display text-2xl font-semibold text-km-ink">
            {cursosRascunho > 0
              ? "Você tem curso em rascunho"
              : "Comece criando seu primeiro curso"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-km-ink-soft">
            {cursosRascunho > 0
              ? "Termine de montar o conteúdo e publique para que os alunos possam ver."
              : "Monte a trilha com módulos e aulas. Nada fica visível para o aluno até você publicar."}
          </p>
          <Link
            href={cursosRascunho > 0 ? "/admin/cursos" : "/admin/cursos/novo"}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-km-brand px-6 py-3 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
          >
            {cursosRascunho > 0 ? "Ver meus cursos" : "Criar curso"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
