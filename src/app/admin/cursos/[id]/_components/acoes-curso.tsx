"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Archive, Eye, EyeOff, Loader2, Trash2 } from "lucide-react"
import { Aviso, botaoPrimario, botaoSecundario } from "@/app/admin/_components/ui"
import {
  arquivarCurso,
  despublicarCurso,
  excluirCurso,
  publicarCurso,
} from "../../_actions/curso"

export function AcoesCurso({
  id,
  status,
}: {
  id: string
  status: "RASCUNHO" | "PUBLICADO" | "ARQUIVADO"
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState("")
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  function executar(
    acao: () => Promise<{ ok: boolean; error?: string }>,
    aoConcluir?: () => void
  ) {
    setErro("")
    iniciar(async () => {
      const r = await acao()
      if (!r.ok) {
        setErro(r.error ?? "Não foi possível concluir a ação.")
        return
      }
      aoConcluir ? aoConcluir() : router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {erro && <Aviso texto={erro} />}

      <div className="flex flex-wrap gap-2">
        {status === "PUBLICADO" ? (
          <button
            type="button"
            className={botaoSecundario}
            disabled={pendente}
            onClick={() => executar(() => despublicarCurso(id))}
          >
            {pendente ? <Loader2 className="size-4 animate-spin" /> : <EyeOff className="size-4" />}
            Despublicar
          </button>
        ) : (
          <button
            type="button"
            className={botaoPrimario}
            disabled={pendente}
            onClick={() => executar(() => publicarCurso(id))}
          >
            {pendente ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
            Publicar curso
          </button>
        )}

        {status !== "ARQUIVADO" && (
          <button
            type="button"
            className={botaoSecundario}
            disabled={pendente}
            onClick={() => executar(() => arquivarCurso(id))}
            title="Some do catálogo, mas quem já comprou continua acessando"
          >
            <Archive className="size-4" />
            Arquivar
          </button>
        )}

        {confirmandoExclusao ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
            <span className="text-sm text-red-500 dark:text-red-400">Excluir de vez?</span>
            <button
              type="button"
              className="text-sm font-medium text-red-500 underline dark:text-red-400"
              disabled={pendente}
              onClick={() =>
                executar(
                  () => excluirCurso(id),
                  () => router.push("/admin/cursos")
                )
              }
            >
              Sim, excluir
            </button>
            <button
              type="button"
              className="text-sm text-km-ink-soft underline"
              onClick={() => setConfirmandoExclusao(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={botaoSecundario}
            onClick={() => setConfirmandoExclusao(true)}
          >
            <Trash2 className="size-4" />
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}
