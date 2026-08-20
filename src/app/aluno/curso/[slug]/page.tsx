import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { obterSalaDeAula } from "@/lib/cursos"

/**
 * Ponto de entrada do curso. Não renderiza nada: decide qual aula abrir e
 * redireciona. Assim "Continuar" leva de fato para onde o aluno parou.
 */
export default async function EntradaDoCursoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/aluno/curso/${slug}`)

  const sala = await obterSalaDeAula({
    slugCurso: slug,
    userId: session.user.id,
    papel: session.user.role,
  })
  if (!sala) notFound()

  const disponiveis = sala.trilha.filter((a) => a.liberada)

  // Nenhuma aula liberada: manda para a página de vendas explicar o porquê
  if (disponiveis.length === 0) redirect(`/cursos/${slug}`)

  // Retoma na primeira não concluída; se terminou tudo, volta para a primeira
  const proxima = disponiveis.find((a) => !a.concluida) ?? disponiveis[0]

  redirect(`/aluno/curso/${slug}/${proxima.slug}`)
}
