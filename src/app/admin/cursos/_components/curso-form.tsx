"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Aviso, Campo, botaoPrimario, botaoSecundario, inputBase } from "@/app/admin/_components/ui"
import { precoParaCentavos } from "@/lib/formato"
import { atualizarCurso, criarCurso } from "../_actions/curso"

export type CursoFormValores = {
  id?: string
  titulo: string
  subtitulo: string
  descricao: string
  nivel: "INTRODUTORIO" | "INTERMEDIARIO" | "AVANCADO"
  cargaHorariaMinutos: number
  precoCentavos: number
  precoDeCentavos: number | null
  tipoAcesso: "VITALICIO" | "PRAZO_DIAS"
  acessoDias: number | null
  emiteCertificado: boolean
  percentualParaCertificado: number
}

const VAZIO: CursoFormValores = {
  titulo: "",
  subtitulo: "",
  descricao: "",
  nivel: "INTRODUTORIO",
  cargaHorariaMinutos: 0,
  precoCentavos: 0,
  precoDeCentavos: null,
  tipoAcesso: "VITALICIO",
  acessoDias: null,
  emiteCertificado: true,
  percentualParaCertificado: 100,
}

function paraReais(centavos: number | null) {
  if (!centavos) return ""
  return (centavos / 100).toFixed(2).replace(".", ",")
}

export function CursoForm({ inicial }: { inicial?: CursoFormValores }) {
  const router = useRouter()
  const base = inicial ?? VAZIO
  const editando = !!inicial?.id

  const [v, setV] = useState({
    ...base,
    preco: paraReais(base.precoCentavos),
    precoDe: paraReais(base.precoDeCentavos),
    cargaHoraria: base.cargaHorariaMinutos ? String(base.cargaHorariaMinutos) : "",
    acessoDiasTxt: base.acessoDias ? String(base.acessoDias) : "",
  })
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  function alterar<K extends keyof typeof v>(campo: K, valor: (typeof v)[K]) {
    setV((atual) => ({ ...atual, [campo]: valor }))
  }

  async function aoEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setSalvando(true)

    const payload = {
      titulo: v.titulo,
      subtitulo: v.subtitulo,
      descricao: v.descricao,
      nivel: v.nivel,
      cargaHorariaMinutos: Number(v.cargaHoraria) || 0,
      precoCentavos: precoParaCentavos(v.preco),
      precoDeCentavos: v.precoDe ? precoParaCentavos(v.precoDe) : null,
      tipoAcesso: v.tipoAcesso,
      acessoDias: v.tipoAcesso === "PRAZO_DIAS" ? Number(v.acessoDiasTxt) || null : null,
      emiteCertificado: v.emiteCertificado,
      percentualParaCertificado: v.percentualParaCertificado,
    }

    const r = editando
      ? await atualizarCurso(inicial!.id!, payload)
      : await criarCurso(payload)

    if (!r.ok) {
      setErro(r.error)
      setSalvando(false)
      return
    }

    if (editando) {
      setSalvando(false)
      router.refresh()
    } else {
      router.push(`/admin/cursos/${r.data!.id}`)
    }
  }

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-6">
      {erro && <Aviso texto={erro} />}

      <Campo rotulo="Título do curso" htmlFor="titulo">
        <input
          id="titulo"
          className={inputBase}
          value={v.titulo}
          onChange={(e) => alterar("titulo", e.target.value)}
          placeholder="Ex.: Emergências cardiológicas na prática"
          required
          minLength={3}
        />
      </Campo>

      <Campo rotulo="Subtítulo" htmlFor="subtitulo" dica="Uma linha que complementa o título. Opcional.">
        <input
          id="subtitulo"
          className={inputBase}
          value={v.subtitulo}
          onChange={(e) => alterar("subtitulo", e.target.value)}
          placeholder="O que o aluno vai conseguir fazer ao terminar"
        />
      </Campo>

      <Campo rotulo="Descrição" htmlFor="descricao" dica="Aparece na página de vendas do curso.">
        <textarea
          id="descricao"
          rows={5}
          className={inputBase}
          value={v.descricao}
          onChange={(e) => alterar("descricao", e.target.value)}
          placeholder="Para quem é o curso, o que ele cobre e por que vale a pena."
        />
      </Campo>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo rotulo="Nível" htmlFor="nivel">
          <select
            id="nivel"
            className={inputBase}
            value={v.nivel}
            onChange={(e) => alterar("nivel", e.target.value as CursoFormValores["nivel"])}
          >
            <option value="INTRODUTORIO">Introdutório</option>
            <option value="INTERMEDIARIO">Intermediário</option>
            <option value="AVANCADO">Avançado</option>
          </select>
        </Campo>

        <Campo
          rotulo="Carga horária (minutos)"
          htmlFor="carga"
          dica="Vai impressa no certificado."
        >
          <input
            id="carga"
            type="number"
            min={0}
            className={inputBase}
            value={v.cargaHoraria}
            onChange={(e) => alterar("cargaHoraria", e.target.value)}
            placeholder="Ex.: 480"
          />
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo rotulo="Preço (R$)" htmlFor="preco" dica="Use 0 para curso gratuito.">
          <input
            id="preco"
            inputMode="decimal"
            className={inputBase}
            value={v.preco}
            onChange={(e) => alterar("preco", e.target.value)}
            placeholder="497,00"
          />
        </Campo>

        <Campo
          rotulo='Preço "de" (R$)'
          htmlFor="precoDe"
          dica="Só para mostrar desconto. Deixe vazio se não houver."
        >
          <input
            id="precoDe"
            inputMode="decimal"
            className={inputBase}
            value={v.precoDe}
            onChange={(e) => alterar("precoDe", e.target.value)}
            placeholder="697,00"
          />
        </Campo>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo rotulo="Tipo de acesso" htmlFor="tipoAcesso">
          <select
            id="tipoAcesso"
            className={inputBase}
            value={v.tipoAcesso}
            onChange={(e) => alterar("tipoAcesso", e.target.value as CursoFormValores["tipoAcesso"])}
          >
            <option value="VITALICIO">Vitalício</option>
            <option value="PRAZO_DIAS">Por prazo determinado</option>
          </select>
        </Campo>

        {v.tipoAcesso === "PRAZO_DIAS" && (
          <Campo rotulo="Dias de acesso" htmlFor="acessoDias" dica="365 = um ano.">
            <input
              id="acessoDias"
              type="number"
              min={1}
              className={inputBase}
              value={v.acessoDiasTxt}
              onChange={(e) => alterar("acessoDiasTxt", e.target.value)}
              placeholder="365"
            />
          </Campo>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-km-line bg-km-surface p-5">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={v.emiteCertificado}
            onChange={(e) => alterar("emiteCertificado", e.target.checked)}
            className="mt-0.5 size-4 accent-km-brand"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-km-ink">Emitir certificado</span>
            <span className="text-xs text-km-ink-faint">
              O aluno recebe um PDF com código de validação ao concluir.
            </span>
          </span>
        </label>

        {v.emiteCertificado && (
          <Campo
            rotulo="Conclusão mínima para o certificado (%)"
            htmlFor="percentual"
            className="max-w-xs"
          >
            <input
              id="percentual"
              type="number"
              min={1}
              max={100}
              className={inputBase}
              value={v.percentualParaCertificado}
              onChange={(e) =>
                alterar("percentualParaCertificado", Number(e.target.value) || 100)
              }
            />
          </Campo>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={salvando} className={botaoPrimario}>
          {salvando && <Loader2 className="size-4 animate-spin" />}
          {editando ? "Salvar alterações" : "Criar curso"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/cursos")}
          className={botaoSecundario}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
