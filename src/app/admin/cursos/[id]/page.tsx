import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Eye } from "lucide-react"
import prisma from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EtiquetaStatus } from "@/app/admin/_components/ui"
import { CursoForm } from "../_components/curso-form"
import { Estrutura } from "./_components/estrutura"
import { AcoesCurso } from "./_components/acoes-curso"

export const metadata: Metadata = {
  title: "Editar curso",
  robots: { index: false, follow: false },
}

export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const curso = await prisma.curso.findUnique({
    where: { id },
    include: {
      modulos: {
        orderBy: { ordem: "asc" },
        include: {
          aulas: {
            orderBy: { ordem: "asc" },
            select: {
              id: true,
              titulo: true,
              tipo: true,
              gratuita: true,
              publicada: true,
              videoUid: true,
              videoPronto: true,
              duracaoSegundos: true,
            },
          },
        },
      },
    },
  })

  if (!curso) notFound()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/cursos"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-km-ink-faint transition-colors hover:text-km-brand"
        >
          <ArrowLeft className="size-3.5" />
          Voltar para cursos
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-km-ink">
                {curso.titulo}
              </h1>
              <EtiquetaStatus status={curso.status} />
            </div>
            <p className="font-mono text-xs text-km-ink-faint">/cursos/{curso.slug}</p>
          </div>

          {/* Pré-visualização: a ADMIN entra na sala de aula sem matrícula,
              para conferir o que o aluno vai ver antes de liberar o acesso */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/aluno/curso/${curso.slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-km-line px-4 py-2.5 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
            >
              <Eye className="size-4" />
              Ver como aluno
            </Link>
            <Link
              href={`/cursos/${curso.slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-km-line px-4 py-2.5 text-sm font-medium text-km-ink transition-colors hover:border-km-brand hover:text-km-brand"
            >
              <ExternalLink className="size-4" />
              Página de vendas
            </Link>
          </div>
        </div>

        <AcoesCurso id={curso.id} status={curso.status} />
      </div>

      <Tabs defaultValue="conteudo" className="w-full">
        <TabsList>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="dados">Dados do curso</TabsTrigger>
        </TabsList>

        <TabsContent value="conteudo" className="pt-6">
          <Estrutura cursoId={curso.id} modulos={curso.modulos} />
        </TabsContent>

        <TabsContent value="dados" className="max-w-2xl pt-6">
          <CursoForm
            inicial={{
              id: curso.id,
              titulo: curso.titulo,
              subtitulo: curso.subtitulo ?? "",
              descricao: curso.descricao ?? "",
              nivel: curso.nivel,
              cargaHorariaMinutos: curso.cargaHorariaMinutos,
              precoCentavos: curso.precoCentavos,
              precoDeCentavos: curso.precoDeCentavos,
              tipoAcesso: curso.tipoAcesso,
              acessoDias: curso.acessoDias,
              emiteCertificado: curso.emiteCertificado,
              percentualParaCertificado: curso.percentualParaCertificado,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
