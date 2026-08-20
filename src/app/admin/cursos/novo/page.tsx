import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CursoForm } from "../_components/curso-form"

export const metadata: Metadata = {
  title: "Novo curso",
  robots: { index: false, follow: false },
}

export default function NovoCursoPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <Link
          href="/admin/cursos"
          className="inline-flex items-center gap-1.5 text-xs text-km-ink-faint transition-colors hover:text-km-brand"
        >
          <ArrowLeft className="size-3.5" />
          Voltar para cursos
        </Link>
        <h1 className="pt-3 font-display text-3xl font-semibold tracking-tight text-km-ink">
          Novo curso
        </h1>
        <p className="pt-1.5 text-sm text-km-ink-soft">
          O curso nasce como rascunho. Nada fica visível para o aluno até você publicar.
        </p>
      </div>

      <CursoForm />
    </div>
  )
}
