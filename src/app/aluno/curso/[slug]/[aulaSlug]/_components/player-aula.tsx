"use client"

import { useEffect, useState } from "react"

/**
 * Player do Cloudflare Stream.
 *
 * O `src` já vem assinado do servidor — o token só é gerado depois de a
 * matrícula ter sido conferida. Não há chamada de autorização aqui no cliente.
 *
 * Por cima do vídeo fica a marca d'água com os dados de quem está assistindo,
 * reposicionada periodicamente para não dar para recortar fora.
 */
export function PlayerAula({
  src,
  identificacao,
}: {
  src: string
  identificacao: string
}) {
  const [pos, setPos] = useState({ top: "8%", left: "6%" })

  useEffect(() => {
    const mover = () => {
      setPos({
        top: `${8 + Math.random() * 74}%`,
        left: `${5 + Math.random() * 62}%`,
      })
    }
    const id = setInterval(mover, 25000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-km-line bg-km-band">
      <iframe
        src={src}
        title="Player da aula"
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute inset-0 size-full"
      />

      <span
        aria-hidden
        className="pointer-events-none absolute z-10 font-mono text-[11px] text-white/25 transition-all duration-1000 select-none"
        style={pos}
      >
        {identificacao}
      </span>
    </div>
  )
}

/** Mostrado quando a aula é de vídeo mas o arquivo ainda não ficou pronto. */
export function PlayerIndisponivel({ mensagem }: { mensagem: string }) {
  return (
    <div className="grid aspect-video w-full place-items-center rounded-xl border border-dashed border-km-line bg-km-surface p-8 text-center">
      <p className="max-w-sm text-sm text-km-ink-soft">{mensagem}</p>
    </div>
  )
}
