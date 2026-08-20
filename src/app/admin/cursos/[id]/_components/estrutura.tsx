"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Video,
} from "lucide-react"
import { Aviso, botaoPrimario, botaoSecundario, botaoIcone, inputBase } from "@/app/admin/_components/ui"
import { formatarDuracao } from "@/lib/formato"
import {
  alternarPublicacaoAula,
  criarAula,
  criarModulo,
  excluirAula,
  excluirModulo,
  moverAula,
  moverModulo,
} from "../../_actions/estrutura"
import { UploadVideo } from "./upload-video"
import { EditarAula, type AulaEditavel } from "./editar-aula"

type Aula = {
  id: string
  titulo: string
  descricao: string | null
  capaUrl: string | null
  tipo: "VIDEO" | "TEXTO" | "PDF"
  gratuita: boolean
  publicada: boolean
  videoUid: string | null
  videoPronto: boolean
  duracaoSegundos: number | null
}

type Modulo = {
  id: string
  titulo: string
  aulas: Aula[]
}

const ICONE_TIPO = { VIDEO: Video, TEXTO: FileText, PDF: FileText } as const

export function Estrutura({ cursoId, modulos }: { cursoId: string; modulos: Modulo[] }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState("")
  const [novoModulo, setNovoModulo] = useState("")
  const [aulaEm, setAulaEm] = useState<string | null>(null)
  const [tituloAula, setTituloAula] = useState("")
  const [tipoAula, setTipoAula] = useState<"VIDEO" | "TEXTO" | "PDF">("VIDEO")
  const [editando, setEditando] = useState<AulaEditavel | null>(null)

  /** Roda a ação, mostra o erro se houver e recarrega os dados do servidor. */
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

  const totalAulas = modulos.reduce((t, m) => t + m.aulas.length, 0)

  return (
    <div className="flex flex-col gap-6">
      {erro && <Aviso texto={erro} />}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-km-ink-soft">
          {modulos.length} módulo{modulos.length === 1 ? "" : "s"} · {totalAulas} aula
          {totalAulas === 1 ? "" : "s"}
        </p>
        {pendente && (
          <span className="inline-flex items-center gap-2 text-xs text-km-ink-faint">
            <Loader2 className="size-3.5 animate-spin" />
            salvando…
          </span>
        )}
      </div>

      {modulos.length === 0 && (
        <div className="rounded-xl border border-dashed border-km-line bg-km-surface p-10 text-center">
          <p className="text-km-ink-soft">
            Comece criando o primeiro módulo. Ele é o agrupamento das aulas.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {modulos.map((modulo, i) => (
          <section key={modulo.id} className="rounded-xl border border-km-line bg-km-surface">
            <header className="flex items-center gap-3 border-b border-km-line-soft px-4 py-3 sm:px-5">
              <span className="font-mono text-xs text-km-ink-faint tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="flex-1 font-display text-lg font-semibold text-km-ink">
                {modulo.titulo}
              </h3>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  className={botaoIcone}
                  disabled={i === 0 || pendente}
                  onClick={() => executar(() => moverModulo(modulo.id, "cima"))}
                  aria-label={`Mover módulo ${modulo.titulo} para cima`}
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  className={botaoIcone}
                  disabled={i === modulos.length - 1 || pendente}
                  onClick={() => executar(() => moverModulo(modulo.id, "baixo"))}
                  aria-label={`Mover módulo ${modulo.titulo} para baixo`}
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  className={botaoIcone}
                  disabled={pendente}
                  onClick={() => executar(() => excluirModulo(modulo.id))}
                  aria-label={`Excluir módulo ${modulo.titulo}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </header>

            <ul className="divide-y divide-km-line-soft">
              {modulo.aulas.map((aula, j) => {
                const Icone = ICONE_TIPO[aula.tipo]
                return (
                  <li key={aula.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <Icone className="size-4 shrink-0 text-km-ink-faint" />

                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <button
                        type="button"
                        onClick={() =>
                          setEditando({
                            id: aula.id,
                            moduloId: modulo.id,
                            titulo: aula.titulo,
                            descricao: aula.descricao,
                            capaUrl: aula.capaUrl,
                            tipo: aula.tipo,
                            gratuita: aula.gratuita,
                          })
                        }
                        className="max-w-full truncate text-left text-sm text-km-ink transition-colors hover:text-km-brand"
                        title="Editar aula"
                      >
                        {aula.titulo}
                      </button>
                      <span className="flex flex-wrap items-center gap-x-2 font-mono text-[10px] text-km-ink-faint">
                        <span>{aula.publicada ? "publicada" : "rascunho"}</span>
                        {aula.gratuita && <span className="text-km-brand">· amostra</span>}
                        {aula.duracaoSegundos ? (
                          <span>· {formatarDuracao(Math.round(aula.duracaoSegundos / 60))}</span>
                        ) : aula.tipo === "VIDEO" && !aula.videoPronto ? (
                          <span className="text-km-gold">· sem vídeo</span>
                        ) : null}
                      </span>
                    </div>

                    {aula.tipo === "VIDEO" && (
                      <UploadVideo
                        aulaId={aula.id}
                        temVideo={!!aula.videoUid}
                        videoPronto={aula.videoPronto}
                      />
                    )}

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        className={botaoIcone}
                        disabled={pendente}
                        onClick={() => executar(() => alternarPublicacaoAula(aula.id))}
                        aria-label={aula.publicada ? "Despublicar aula" : "Publicar aula"}
                        title={aula.publicada ? "Despublicar" : "Publicar"}
                      >
                        {aula.publicada ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      <button
                        type="button"
                        className={botaoIcone}
                        disabled={j === 0 || pendente}
                        onClick={() => executar(() => moverAula(aula.id, "cima"))}
                        aria-label="Mover aula para cima"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        className={botaoIcone}
                        disabled={j === modulo.aulas.length - 1 || pendente}
                        onClick={() => executar(() => moverAula(aula.id, "baixo"))}
                        aria-label="Mover aula para baixo"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        className={botaoIcone}
                        disabled={pendente}
                        onClick={() => executar(() => excluirAula(aula.id))}
                        aria-label="Excluir aula"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="px-4 py-3 sm:px-5">
              {aulaEm === modulo.id ? (
                <form
                  className="flex flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const titulo = tituloAula
                    const tipo = tipoAula
                    executar(async () => {
                      const r = await criarAula({ moduloId: modulo.id, titulo, tipo })
                      if (r.ok) {
                        setTituloAula("")
                        setAulaEm(null)
                      }
                      return r
                    })
                  }}
                >
                  <input
                    autoFocus
                    className={`${inputBase} flex-1 min-w-[14rem]`}
                    value={tituloAula}
                    onChange={(e) => setTituloAula(e.target.value)}
                    placeholder="Título da aula"
                    required
                    minLength={2}
                  />
                  <select
                    aria-label="Tipo da aula"
                    className={`${inputBase} w-auto`}
                    value={tipoAula}
                    onChange={(e) => setTipoAula(e.target.value as typeof tipoAula)}
                  >
                    <option value="VIDEO">Vídeo</option>
                    <option value="TEXTO">Texto</option>
                    <option value="PDF">PDF</option>
                  </select>
                  <button type="submit" className={botaoPrimario} disabled={pendente}>
                    Adicionar
                  </button>
                  <button
                    type="button"
                    className={botaoSecundario}
                    onClick={() => {
                      setAulaEm(null)
                      setTituloAula("")
                    }}
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAulaEm(modulo.id)}
                  className="inline-flex items-center gap-1.5 text-sm text-km-ink-soft transition-colors hover:text-km-brand"
                >
                  <Plus className="size-4" />
                  Adicionar aula
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      <form
        className="flex flex-wrap gap-2 rounded-xl border border-dashed border-km-line p-4"
        onSubmit={(e) => {
          e.preventDefault()
          const titulo = novoModulo
          executar(async () => {
            const r = await criarModulo({ cursoId, titulo })
            if (r.ok) setNovoModulo("")
            return r
          })
        }}
      >
        <input
          className={`${inputBase} flex-1 min-w-[14rem]`}
          value={novoModulo}
          onChange={(e) => setNovoModulo(e.target.value)}
          placeholder="Título do novo módulo"
          required
          minLength={2}
        />
        <button type="submit" className={botaoPrimario} disabled={pendente}>
          <Plus className="size-4" />
          Adicionar módulo
        </button>
      </form>

      <EditarAula aula={editando} aoFechar={() => setEditando(null)} />
    </div>
  )
}
