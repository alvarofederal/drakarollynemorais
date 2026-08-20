import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { formatarData } from "@/lib/formato"

export const metadata: Metadata = {
  title: "Alunos",
  robots: { index: false, follow: false },
}

export default async function AdminAlunosPage() {
  const alunos = await prisma.user.findMany({
    where: { role: "ALUNO" },
    orderBy: { criadoEm: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      ativo: true,
      criadoEm: true,
      ultimoAcesso: true,
      _count: { select: { matriculas: true } },
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-km-ink">
          Alunos
        </h1>
        <p className="pt-1.5 text-sm text-km-ink-soft">
          {alunos.length === 0
            ? "Nenhum aluno cadastrado ainda."
            : `${alunos.length} aluno${alunos.length > 1 ? "s" : ""}.`}
        </p>
      </div>

      {alunos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-km-line bg-km-surface p-12 text-center">
          <h2 className="font-display text-xl font-semibold text-km-ink">
            Ainda não há alunos
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-km-ink-soft">
            Assim que alguém se cadastrar ou comprar um curso, aparece aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-km-line bg-km-surface">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-km-line text-left">
                {["Aluno", "Cursos", "Cadastro", "Último acesso", "Situação"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 font-mono text-[10px] tracking-wider text-km-ink-faint uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alunos.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-km-line-soft last:border-0 hover:bg-km-sunk/50"
                >
                  <td className="px-5 py-4">
                    <Link href={`/admin/alunos/${a.id}`} className="font-medium text-km-ink transition-colors hover:text-km-brand">
                      {a.name ?? a.email}
                    </Link>
                    <p className="pt-0.5 font-mono text-xs text-km-ink-faint">{a.email}</p>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-km-ink-soft">
                    {a._count.matriculas}
                  </td>
                  <td className="px-5 py-4 text-km-ink-soft">{formatarData(a.criadoEm)}</td>
                  <td className="px-5 py-4 text-km-ink-soft">
                    {formatarData(a.ultimoAcesso)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        a.ativo
                          ? "font-mono text-[10px] tracking-wider text-km-brand uppercase"
                          : "font-mono text-[10px] tracking-wider text-km-gold uppercase"
                      }
                    >
                      {a.ativo ? "ativo" : "inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
