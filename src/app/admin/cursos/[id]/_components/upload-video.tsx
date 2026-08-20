"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2, Upload } from "lucide-react"
import { botaoIcone } from "@/app/admin/_components/ui"
import { removerVideoDaAula, sincronizarVideoDaAula } from "../../_actions/estrutura"

type Fase = "parado" | "preparando" | "enviando" | "processando" | "erro"

const LIMITE_BYTES = 4 * 1024 * 1024 * 1024 // 4 GB
const TENTATIVAS_MAX = 100 // ~5 min a 3s por tentativa

/** Envia o arquivo direto ao Cloudflare, reportando progresso real. */
function enviarArquivo(url: string, arquivo: File, aoProgredir: (pct: number) => void) {
  return new Promise<void>((resolver, rejeitar) => {
    const form = new FormData()
    form.append("file", arquivo)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgredir(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolver()
        : rejeitar(new Error(`O Cloudflare recusou o envio (HTTP ${xhr.status})`))
    xhr.onerror = () => rejeitar(new Error("Conexão interrompida durante o envio"))
    xhr.onabort = () => rejeitar(new Error("Envio cancelado"))

    xhr.send(form)
  })
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function UploadVideo({
  aulaId,
  temVideo,
  videoPronto,
}: {
  aulaId: string
  temVideo: boolean
  videoPronto: boolean
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fase, setFase] = useState<Fase>("parado")
  const [pct, setPct] = useState(0)
  const [erro, setErro] = useState("")

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = "" // permite reescolher o mesmo arquivo depois
    if (!arquivo) return

    if (!arquivo.type.startsWith("video/")) {
      setFase("erro")
      setErro("Selecione um arquivo de vídeo.")
      return
    }
    if (arquivo.size > LIMITE_BYTES) {
      setFase("erro")
      setErro("O arquivo passa de 4 GB. Comprima antes de enviar.")
      return
    }

    setErro("")
    setPct(0)
    setFase("preparando")

    try {
      const resposta = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aulaId }),
      })
      const dados = await resposta.json()
      if (!resposta.ok) throw new Error(dados.error ?? "Falha ao preparar o envio")

      setFase("enviando")
      await enviarArquivo(dados.uploadURL, arquivo, setPct)

      // O Cloudflare ainda precisa codificar o vídeo antes de liberar
      setFase("processando")
      for (let i = 0; i < TENTATIVAS_MAX; i++) {
        await espera(3000)
        const r = await sincronizarVideoDaAula(aulaId)
        if (r.ok && r.data.pronto) {
          setFase("parado")
          router.refresh()
          return
        }
        if (!r.ok) throw new Error(r.error)
      }

      throw new Error("O vídeo demorou mais que o esperado. Atualize a página em instantes.")
    } catch (e) {
      setFase("erro")
      setErro(e instanceof Error ? e.message : "Falha no envio")
    }
  }

  const ocupado = fase === "preparando" || fase === "enviando" || fase === "processando"

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={aoEscolherArquivo}
      />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={botaoIcone}
          disabled={ocupado}
          onClick={() => inputRef.current?.click()}
          aria-label={temVideo ? "Substituir vídeo" : "Enviar vídeo"}
          title={temVideo ? "Substituir vídeo" : "Enviar vídeo"}
        >
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        </button>

        {temVideo && !ocupado && (
          <button
            type="button"
            className={botaoIcone}
            onClick={async () => {
              const r = await removerVideoDaAula(aulaId)
              if (!r.ok) {
                setFase("erro")
                setErro(r.error)
                return
              }
              router.refresh()
            }}
            aria-label="Remover vídeo"
            title="Remover vídeo"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {fase === "enviando" && (
        <div className="flex w-28 items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-km-sunk">
            <div
              className="h-full rounded-full bg-km-brand transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-km-ink-faint tabular-nums">{pct}%</span>
        </div>
      )}

      {fase === "preparando" && (
        <span className="font-mono text-[10px] text-km-ink-faint">preparando…</span>
      )}
      {fase === "processando" && (
        <span className="font-mono text-[10px] text-km-ink-faint">processando no Cloudflare…</span>
      )}
      {fase === "erro" && (
        <span role="alert" className="max-w-[12rem] text-right text-[10px] text-red-500">
          {erro}
        </span>
      )}
      {fase === "parado" && temVideo && videoPronto && (
        <span className="font-mono text-[10px] text-km-brand">vídeo pronto</span>
      )}
    </div>
  )
}
