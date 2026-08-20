import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import prisma from "@/lib/prisma"
import { formatarDuracao, formatarPreco } from "@/lib/formato"
import { EtiquetaStatus, botaoPrimario } from "@/app/admin/_components/ui"

export const metadata: Metadata = {
  title: "Cursos",
  robots: { index: false, follow: false },
}

export default async function AdminCursosPage() {
  const cursos = await prisma.curso.findMany({
    orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true,
      precoCentavos: true,
      cargaHorariaMinutos: true,
      _count: { select: { matriculas: true } },
      modulos: { select: { _count: { select: { aulas: true } } } },
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-km-ink">
            Cursos
          </h1>
          <p className="pt-1.5 text-sm text-km-ink-soft">
            {cursos.length === 0
              ? "Nenhum curso ainda."
              : `${cursos.length} curso${cursos.length > 1 ? "s" : ""} no total.`}
          </p>
        </div>
        <Link href="/admin/cursos/novo" className={botaoPrimario}>
          <Plus className="size-4" />
          Novo curso
        </Link>
      </div>

      {cursos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-km-line bg-km-surface p-12 text-center">
          <h2 className="font-display text-xl font-semibold text-km-ink">
            Crie seu primeiro curso
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-km-ink-soft">
            Comece pelos dados básicos. Os módulos e as aulas você monta em seguida.
          </p>
          <Link href="/admin/cursos/novo" className={`${botaoPrimario} mt-6`}>
            <Plus className="size-4" />
            Novo curso
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-km-line bg-km-surface">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-km-line text-left">
                {["Curso", "Status", "Aulas", "Carga", "Preço", "Alunos"].map((h) => (
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
              {cursos.map((c) => {
                const aulas = c.modulos.reduce((t, m) => t + m._count.aulas, 0)
                return (
                  <tr
                    key={c.id}
                    className="border-b border-km-line-soft transition-colors last:border-0 hover:bg-km-sunk/50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/cursos/${c.id}`}
                        className="font-medium text-km-ink transition-colors hover:text-km-brand"
                      >
                        {c.titulo}
                      </Link>
                      <p className="pt-0.5 font-mono text-xs text-km-ink-faint">/{c.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <EtiquetaStatus status={c.status} />
                    </td>
                    <td className="px-5 py-4 tabular-nums text-km-ink-soft">{aulas}</td>
                    <td className="px-5 py-4 text-km-ink-soft">
                      {formatarDuracao(c.cargaHorariaMinutos)}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-km-ink-soft">
                      {c.precoCentavos === 0 ? "Gratuito" : formatarPreco(c.precoCentavos)}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-km-ink-soft">
                      {c._count.matriculas}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
