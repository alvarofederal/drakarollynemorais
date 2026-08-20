"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Aviso, Campo, botaoPrimario, botaoSecundario, inputBase } from "@/app/admin/_components/ui"
import { UploadImagem } from "@/app/admin/_components/upload-imagem"
import { atualizarAula } from "../../_actions/estrutura"

export type AulaEditavel = {
  id: string
  moduloId: string
  titulo: string
  descricao: string | null
  capaUrl: string | null
  tipo: "VIDEO" | "TEXTO" | "PDF"
  gratuita: boolean
}

export function EditarAula({
  aula,
  aoFechar,
}: {
  aula: AulaEditavel | null
  aoFechar: () => void
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState("")

  // `key` no Dialog força o formulário a remontar quando troca de aula,
  // senão o estado da aula anterior vaza para a próxima
  if (!aula) return null

  return (
    <Dialog open={!!aula} onOpenChange={(aberto) => !aberto && aoFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Editar aula</DialogTitle>
          <DialogDescription>
            A capa e o texto abaixo são o que o aluno vê no card, antes de abrir a aula.
          </DialogDescription>
        </DialogHeader>

        <FormularioAula
          key={aula.id}
          aula={aula}
          pendente={pendente}
          erro={erro}
          aoSalvar={(dados) => {
            setErro("")
            iniciar(async () => {
              const r = await atualizarAula(aula.id, { ...dados, moduloId: aula.moduloId })
              if (!r.ok) {
                setErro(r.error)
                return
              }
              router.refresh()
              aoFechar()
            })
          }}
          aoCancelar={aoFechar}
        />
      </DialogContent>
    </Dialog>
  )
}

function FormularioAula({
  aula,
  pendente,
  erro,
  aoSalvar,
  aoCancelar,
}: {
  aula: AulaEditavel
  pendente: boolean
  erro: string
  aoSalvar: (dados: {
    titulo: string
    descricao: string
    capaUrl: string | null
    tipo: AulaEditavel["tipo"]
    gratuita: boolean
  }) => void
  aoCancelar: () => void
}) {
  const [titulo, setTitulo] = useState(aula.titulo)
  const [descricao, setDescricao] = useState(aula.descricao ?? "")
  const [capaUrl, setCapaUrl] = useState(aula.capaUrl)
  const [tipo, setTipo] = useState(aula.tipo)
  const [gratuita, setGratuita] = useState(aula.gratuita)

  return (
    <form
      className="flex flex-col gap-5 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        aoSalvar({ titulo, descricao, capaUrl, tipo, gratuita })
      }}
    >
      {erro && <Aviso texto={erro} />}

      <Campo rotulo="Título da aula" htmlFor="ed-titulo">
        <input
          id="ed-titulo"
          className={inputBase}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          minLength={2}
        />
      </Campo>

      <Campo
        rotulo="Capa do card"
        htmlFor="ed-capa"
        dica="Aparece na fileira do curso. Ideal em pé: 600×900 (2:3)."
      >
        <UploadImagem
          valor={capaUrl}
          aoMudar={setCapaUrl}
          proporcao="2/3"
          className="max-w-[10rem]"
        />
      </Campo>

      <Campo
        rotulo="O que tem nesta aula"
        htmlFor="ed-descricao"
        dica="É o balão que aparece ao passar o mouse no card. Escreva o que a aula cobre — serve para orientar quem já comprou e para convencer quem ainda não."
      >
        <textarea
          id="ed-descricao"
          rows={4}
          className={inputBase}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex.: Como reconhecer os sinais precoces e o que fazer nos primeiros 10 minutos."
        />
      </Campo>

      <Campo rotulo="Tipo" htmlFor="ed-tipo">
        <select
          id="ed-tipo"
          className={inputBase}
          value={tipo}
          onChange={(e) => setTipo(e.target.value as AulaEditavel["tipo"])}
        >
          <option value="VIDEO">Vídeo</option>
          <option value="TEXTO">Texto</option>
          <option value="PDF">PDF</option>
        </select>
      </Campo>

      <label className="flex items-start gap-3 rounded-lg border border-km-line bg-km-sunk p-4">
        <input
          type="checkbox"
          checked={gratuita}
          onChange={(e) => setGratuita(e.target.checked)}
          className="mt-0.5 size-4 accent-km-brand"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-km-ink">Aula gratuita</span>
          <span className="text-xs text-km-ink-faint">
            Liberada para qualquer aluno cadastrado, mesmo sem ter comprado. É a
            amostra do curso.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="submit" disabled={pendente} className={botaoPrimario}>
          {pendente && <Loader2 className="size-4 animate-spin" />}
          Salvar
        </button>
        <button type="button" onClick={aoCancelar} className={botaoSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
