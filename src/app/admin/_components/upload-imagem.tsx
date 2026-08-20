"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Envia uma imagem para o Cloudinary e devolve a URL.
 *
 * Usado na capa do curso e na capa da aula. A proporção é só uma dica visual:
 * o corte real acontece no CSS, então uma imagem fora da medida não quebra
 * nada — só fica pior enquadrada.
 */
export function UploadImagem({
  valor,
  aoMudar,
  proporcao = "16/9",
  dica,
  className,
}: {
  valor: string | null
  aoMudar: (url: string | null) => void
  proporcao?: "16/9" | "2/3" | "21/9"
  dica?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState("")

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ""
    if (!arquivo) return

    setErro("")
    setEnviando(true)

    try {
      const form = new FormData()
      form.append("file", arquivo)
      const resposta = await fetch("/api/upload", { method: "POST", body: form })
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados.error ?? "Falha no envio")
      aoMudar(dados.imageUrl)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha no envio")
    } finally {
      setEnviando(false)
    }
  }

  const classesProporcao =
    proporcao === "2/3" ? "aspect-[2/3]" : proporcao === "21/9" ? "aspect-[21/9]" : "aspect-video"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={aoEscolher}
      />

      {valor ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-km-line bg-km-sunk",
            classesProporcao
          )}
        >
          <Image src={valor} alt="" fill sizes="360px" className="object-cover" />
          <button
            type="button"
            onClick={() => aoMudar(null)}
            className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
            aria-label="Remover imagem"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className={cn(
            "grid place-items-center rounded-lg border border-dashed border-km-line bg-km-sunk text-km-ink-faint transition-colors hover:border-km-brand hover:text-km-brand disabled:opacity-60",
            classesProporcao
          )}
        >
          <span className="flex flex-col items-center gap-2">
            {enviando ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            <span className="text-xs">{enviando ? "enviando…" : "Escolher imagem"}</span>
          </span>
        </button>
      )}

      {erro && (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400">
          {erro}
        </p>
      )}
      {dica && !erro && <p className="text-xs text-km-ink-faint">{dica}</p>}
    </div>
  )
}
