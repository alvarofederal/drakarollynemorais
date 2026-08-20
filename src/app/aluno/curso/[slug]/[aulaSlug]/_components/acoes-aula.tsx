"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { alternarConclusaoDaAula } from "@/app/aluno/_actions/progresso"
import { cn } from "@/lib/utils"

export function AcoesAula({
  aulaId,
  concluida,
  podeRegistrarProgresso,
  hrefAnterior,
  hrefProxima,
}: {
  aulaId: string
  concluida: boolean
  podeRegistrarProgresso: boolean
  hrefAnterior: string | null
  hrefProxima: string | null
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState("")

  return (
    <div className="flex flex-col gap-3">
      {erro && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {podeRegistrarProgresso && (
          <button
            type="button"
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                setErro("")
                const r = await alternarConclusaoDaAula(aulaId)
                if (!r.ok) {
                  setErro(r.error)
                  return
                }
                router.refresh()
              })
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
              concluida
                ? "border border-km-brand text-km-brand hover:bg-km-brand-soft"
                : "bg-km-brand text-km-on-brand hover:bg-km-brand-hover"
            )}
          >
            {pendente ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            {concluida ? "Concluída" : "Marcar como concluída"}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {hrefAnterior ? (
            <Link
              href={hrefAnterior}
              className="inline-flex items-center gap-1.5 rounded-md border border-km-line px-4 py-2.5 text-sm text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Link>
          ) : null}

          {hrefProxima ? (
            <Link
              href={hrefProxima}
              className="inline-flex items-center gap-1.5 rounded-md border border-km-line px-4 py-2.5 text-sm text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
            >
              Próxima
              <ChevronRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
