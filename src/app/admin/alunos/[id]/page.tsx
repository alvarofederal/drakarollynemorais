import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import prisma from "@/lib/prisma"
import { formatarData } from "@/lib/formato"
import { GerenciarAcesso } from "./_components/gerenciar-acesso"

export const metadata: Metadata = {
  title: "Aluno",
  robots: { index: false, follow: false },
}

export default async function AlunoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [aluno, cursos] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        telefone: true,
        ativo: true,
        role: true,
        criadoEm: true,
        ultimoAcesso: true,
        matriculas: {
          orderBy: { iniciadaEm: "desc" },
          select: {
            id: true,
            status: true,
            origem: true,
            iniciadaEm: true,
            expiraEm: true,
            percentualConcluido: true,
            curso: { select: { id: true, titulo: true } },
          },
        },
        certificados: {
          select: { id: true, codigo: true, cursoTitulo: true, emitidoEm: true },
        },
      },
    }),
    prisma.curso.findMany({
      where: { status: { not: "ARQUIVADO" } },
      orderBy: { titulo: "asc" },
      select: { id: true, titulo: true, status: true },
    }),
  ])

  if (!aluno) notFound()

  const dados = [
    { rotulo: "E-mail", valor: aluno.email },
    { rotulo: "CPF", valor: aluno.cpf ?? "—" },
    { rotulo: "Telefone", valor: aluno.telefone ?? "—" },
    { rotulo: "Cadastro", valor: formatarData(aluno.criadoEm) },
    { rotulo: "Último acesso", valor: formatarData(aluno.ultimoAcesso) },
    { rotulo: "Papel", valor: aluno.role },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/alunos"
          className="inline-flex items-center gap-1.5 text-xs text-km-ink-faint transition-colors hover:text-km-brand"
        >
          <ArrowLeft className="size-3.5" />
          Voltar para alunos
        </Link>
        <h1 className="pt-3 font-display text-3xl font-semibold tracking-tight text-km-ink">
          {aluno.name ?? aluno.email}
        </h1>
      </div>

      <dl className="flex flex-wrap gap-x-10 gap-y-4 border-y border-km-line py-5 font-mono text-xs">
        {dados.map((d) => (
          <div key={d.rotulo} className="flex flex-col gap-1">
            <dt className="tracking-wide text-km-ink-faint uppercase">{d.rotulo}</dt>
            <dd className="text-km-ink">{d.valor}</dd>
          </div>
        ))}
      </dl>

      <GerenciarAcesso
        userId={aluno.id}
        ativo={aluno.ativo}
        matriculas={aluno.matriculas}
        cursosDisponiveis={cursos}
      />

      {aluno.certificados.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-km-line bg-km-surface">
          <h2 className="border-b border-km-line-soft px-5 py-4 font-display text-lg font-semibold text-km-ink">
            Certificados emitidos
          </h2>
          <ul className="divide-y divide-km-line-soft">
            {aluno.certificados.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="flex-1 text-sm text-km-ink">{c.cursoTitulo}</span>
                <span className="font-mono text-xs text-km-ink-faint">{c.codigo}</span>
                <span className="font-mono text-xs text-km-ink-faint">
                  {formatarData(c.emitidoEm)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
