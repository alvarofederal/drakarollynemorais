"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, X } from "lucide-react"
import { Aviso, botaoPrimario, botaoSecundario, inputBase } from "@/app/admin/_components/ui"
import { formatarData } from "@/lib/formato"
import {
  alternarAtivoDoAluno,
  concederMatricula,
  revogarMatricula,
} from "../../_actions/matricula"

type Matricula = {
  id: string
  status: string
  origem: string
  iniciadaEm: Date
  expiraEm: Date | null
  percentualConcluido: number
  curso: { id: string; titulo: string }
}

type CursoOpcao = { id: string; titulo: string; status: string }

export function GerenciarAcesso({
  userId,
  ativo,
  matriculas,
  cursosDisponiveis,
}: {
  userId: string
  ativo: boolean
  matriculas: Matricula[]
  cursosDisponiveis: CursoOpcao[]
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState("")
  const [cursoId, setCursoId] = useState("")

  function executar(acao: () => Promise<{ ok: boolean; error?: string }>) {
    setErro("")
    iniciar(async () => {
      const r = await acao()
      if (!r.ok) {
        setErro(r.error ?? "Não foi possível concluir a ação.")
        return
      }
      router.refresh()
    })
  }

  const naoMatriculados = cursosDisponiveis.filter(
    (c) => !matriculas.some((m) => m.curso.id === c.id && m.status === "ATIVA")
  )

  return (
    <div className="flex flex-col gap-6">
      {erro && <Aviso texto={erro} />}

      {/* conceder acesso */}
      <div className="rounded-xl border border-km-line bg-km-surface p-5">
        <h2 className="font-display text-lg font-semibold text-km-ink">Liberar acesso</h2>
        <p className="pt-1 text-sm text-km-ink-soft">
          Dá acesso ao curso sem passar por pagamento — cortesia, turma presencial ou
          correção de uma compra que falhou.
        </p>

        {naoMatriculados.length === 0 ? (
          <p className="pt-4 text-sm text-km-ink-faint">
            Este aluno já tem acesso a todos os cursos existentes.
          </p>
        ) : (
          <form
            className="flex flex-wrap gap-2 pt-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!cursoId) return
              const id = cursoId
              executar(async () => {
                const r = await concederMatricula(userId, id)
                if (r.ok) setCursoId("")
                return r
              })
            }}
          >
            <select
              aria-label="Curso a liberar"
              className={`${inputBase} min-w-[16rem] flex-1`}
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              required
            >
              <option value="">Escolha um curso…</option>
              {naoMatriculados.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.titulo}
                  {c.status !== "PUBLICADO" ? ` (${c.status.toLowerCase()})` : ""}
                </option>
              ))}
            </select>
            <button type="submit" className={botaoPrimario} disabled={pendente || !cursoId}>
              {pendente ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Liberar
            </button>
          </form>
        )}
      </div>

      {/* matrículas existentes */}
      <div className="overflow-hidden rounded-xl border border-km-line bg-km-surface">
        <h2 className="border-b border-km-line-soft px-5 py-4 font-display text-lg font-semibold text-km-ink">
          Cursos deste aluno
        </h2>

        {matriculas.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-km-ink-faint">
            Nenhuma matrícula ainda.
          </p>
        ) : (
          <ul className="divide-y divide-km-line-soft">
            {matriculas.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-km-ink">{m.curso.titulo}</span>
                  <span className="flex flex-wrap gap-x-2 font-mono text-[11px] text-km-ink-faint">
                    <span
                      className={m.status === "ATIVA" ? "text-km-brand" : "text-km-gold"}
                    >
                      {m.status.toLowerCase()}
                    </span>
                    <span>· {m.origem.toLowerCase()}</span>
                    <span>· desde {formatarData(m.iniciadaEm)}</span>
                    {m.expiraEm && <span>· expira {formatarData(m.expiraEm)}</span>}
                    <span>· {m.percentualConcluido}% concluído</span>
                  </span>
                </div>

                {m.status === "ATIVA" && (
                  <button
                    type="button"
                    className={botaoSecundario}
                    disabled={pendente}
                    onClick={() => executar(() => revogarMatricula(m.id))}
                  >
                    <X className="size-4" />
                    Revogar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* situação da conta */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-km-line bg-km-surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-km-ink">Conta do aluno</h2>
          <p className="pt-1 text-sm text-km-ink-soft">
            {ativo
              ? "A conta está ativa. Desativar bloqueia o login em até 5 minutos."
              : "A conta está desativada. O aluno não consegue entrar."}
          </p>
        </div>
        <button
          type="button"
          className={botaoSecundario}
          disabled={pendente}
          onClick={() => executar(() => alternarAtivoDoAluno(userId))}
        >
          {ativo ? "Desativar conta" : "Reativar conta"}
        </button>
      </div>
    </div>
  )
}
