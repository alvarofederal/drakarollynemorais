import prisma from "./prisma"
import { temAssinaturaAtiva, verificarAcesso, type MotivoDeAcesso } from "./acesso"

/**
 * Consultas de leitura de curso usadas pelas páginas públicas e pela área do
 * aluno. Ficam juntas para que "o que é visível publicamente" seja decidido
 * num lugar só — e não espalhado por cada tela.
 */

/** Só PUBLICADO aparece no catálogo. Rascunho e arquivado ficam de fora. */
export async function listarCursosDoCatalogo() {
  return prisma.curso.findMany({
    where: { status: "PUBLICADO" },
    orderBy: [{ destaque: "desc" }, { ordem: "asc" }, { publicadoEm: "desc" }],
    select: {
      id: true,
      slug: true,
      titulo: true,
      subtitulo: true,
      capaUrl: true,
      nivel: true,
      precoCentavos: true,
      precoDeCentavos: true,
      cargaHorariaMinutos: true,
      professor: { select: { nome: true, titulacao: true } },
      modulos: {
        select: { _count: { select: { aulas: { where: { publicada: true } } } } },
      },
      _count: { select: { matriculas: { where: { status: "ATIVA" } } } },
    },
  })
}

export type CursoDoCatalogo = Awaited<ReturnType<typeof listarCursosDoCatalogo>>[number]

export function contarAulas(curso: { modulos: { _count: { aulas: number } }[] }) {
  return curso.modulos.reduce((total, m) => total + m._count.aulas, 0)
}

/**
 * Curso completo para a página pública de vendas.
 *
 * A ementa mostra TODAS as aulas publicadas, inclusive as que o visitante ainda
 * não pode assistir — quem está decidindo comprar precisa ver o que vai receber.
 * O que não vaza é o conteúdo em si: nem `videoUid`, nem material.
 */
export async function obterCursoPublico(slug: string) {
  const curso = await prisma.curso.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      titulo: true,
      subtitulo: true,
      descricao: true,
      capaUrl: true,
      nivel: true,
      status: true,
      precoCentavos: true,
      precoDeCentavos: true,
      cargaHorariaMinutos: true,
      emiteCertificado: true,
      tipoAcesso: true,
      acessoDias: true,
      professor: {
        select: { nome: true, slug: true, titulacao: true, crm: true, especialidade: true, fotoUrl: true },
      },
      modulos: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          aulas: {
            where: { publicada: true },
            orderBy: { ordem: "asc" },
            select: {
              id: true,
              slug: true,
              titulo: true,
              tipo: true,
              gratuita: true,
              duracaoSegundos: true,
            },
          },
        },
      },
      depoimentos: { where: { aprovado: true }, orderBy: { ordem: "asc" } },
      faqs: { orderBy: { ordem: "asc" } },
      _count: { select: { matriculas: { where: { status: "ATIVA" } } } },
    },
  })

  // Arquivado continua acessível por link direto para quem já comprou,
  // mas rascunho nunca é público
  if (!curso || curso.status === "RASCUNHO") return null

  return curso
}

/** Cursos em que o aluno tem matrícula ativa e dentro do prazo. */
export async function listarCursosDoAluno(userId: string) {
  const matriculas = await prisma.matricula.findMany({
    where: {
      userId,
      status: "ATIVA",
      OR: [{ expiraEm: null }, { expiraEm: { gt: new Date() } }],
    },
    orderBy: { iniciadaEm: "desc" },
    select: {
      id: true,
      percentualConcluido: true,
      iniciadaEm: true,
      expiraEm: true,
      concluidaEm: true,
      curso: {
        select: {
          id: true,
          slug: true,
          titulo: true,
          subtitulo: true,
          capaUrl: true,
          cargaHorariaMinutos: true,
          modulos: {
            select: { _count: { select: { aulas: { where: { publicada: true } } } } },
          },
        },
      },
    },
  })

  return matriculas
}

/**
 * Tudo que a sala de aula precisa, com o acesso já decidido aqui dentro.
 *
 * Devolve `null` quando o curso não existe. Devolve `acessoLiberado: false`
 * quando existe mas a pessoa não pode assistir — quem chama decide se
 * redireciona ou mostra a amostra.
 */
export async function obterSalaDeAula(opcoes: {
  slugCurso: string
  userId?: string
  papel?: string
}) {
  const { slugCurso, userId, papel } = opcoes

  const curso = await prisma.curso.findUnique({
    where: { slug: slugCurso },
    select: {
      id: true,
      slug: true,
      titulo: true,
      status: true,
      percentualParaCertificado: true,
      emiteCertificado: true,
      modulos: {
        orderBy: { ordem: "asc" },
        select: {
          id: true,
          titulo: true,
          aulas: {
            where: { publicada: true },
            orderBy: { ordem: "asc" },
            select: {
              id: true,
              slug: true,
              titulo: true,
              descricao: true,
              tipo: true,
              gratuita: true,
              videoUid: true,
              videoPronto: true,
              duracaoSegundos: true,
            },
          },
        },
      },
    },
  })

  if (!curso || curso.status === "RASCUNHO") return null

  const acessoLiberado = userId
    ? await verificarAcesso(userId, curso.id, papel)
    : false

  // Progresso de todas as aulas deste curso, de uma vez só
  const progressos = userId
    ? await prisma.progressoAula.findMany({
        where: { userId, aula: { modulo: { cursoId: curso.id } } },
        select: { aulaId: true, concluida: true, ultimaPosicao: true },
      })
    : []

  const porAula = new Map(progressos.map((p) => [p.aulaId, p]))

  const matricula = userId
    ? await prisma.matricula.findUnique({
        where: { userId_cursoId: { userId, cursoId: curso.id } },
        select: { id: true, percentualConcluido: true },
      })
    : null

  // Achata a trilha para facilitar "próxima" e "anterior"
  const trilha = curso.modulos.flatMap((m) =>
    m.aulas.map((a) => ({
      ...a,
      moduloId: m.id,
      moduloTitulo: m.titulo,
      concluida: porAula.get(a.id)?.concluida ?? false,
      ultimaPosicao: porAula.get(a.id)?.ultimaPosicao ?? 0,
      // A amostra gratuita é a única exceção ao portão de matrícula
      liberada: acessoLiberado || a.gratuita,
    }))
  )

  return { curso, acessoLiberado, matricula, trilha }
}

export type Trilha = NonNullable<Awaited<ReturnType<typeof obterSalaDeAula>>>["trilha"]

/**
 * A vitrine da área do aluno: todos os cursos publicados, cada um com o estado
 * de acesso de cada aula já resolvido.
 *
 * Monta em três consultas, não em N+1: cursos, matrículas e progressos vêm de
 * uma vez e são cruzados em memória.
 *
 * ⚠️ NÃO seleciona `videoUid`. O identificador do vídeo não tem por que sair do
 * servidor numa listagem — só na sala de aula, e só da aula liberada.
 */
export async function listarVitrineDoAluno(userId: string, papel?: string) {
  const agora = new Date()

  const [cursos, matriculas, progressos, assinante] = await Promise.all([
    prisma.curso.findMany({
      where: { status: "PUBLICADO" },
      orderBy: [{ destaque: "desc" }, { ordem: "asc" }, { publicadoEm: "desc" }],
      select: {
        id: true,
        slug: true,
        titulo: true,
        subtitulo: true,
        capaUrl: true,
        cargaHorariaMinutos: true,
        precoCentavos: true,
        acessoDias: true,
        tipoAcesso: true,
        modulos: {
          orderBy: { ordem: "asc" },
          select: {
            id: true,
            titulo: true,
            aulas: {
              where: { publicada: true },
              orderBy: { ordem: "asc" },
              select: {
                id: true,
                slug: true,
                titulo: true,
                descricao: true,
                capaUrl: true,
                tipo: true,
                gratuita: true,
                duracaoSegundos: true,
              },
            },
          },
        },
      },
    }),
    prisma.matricula.findMany({
      where: { userId },
      select: { cursoId: true, status: true, expiraEm: true, percentualConcluido: true },
    }),
    prisma.progressoAula.findMany({
      where: { userId, concluida: true },
      select: { aulaId: true },
    }),
    temAssinaturaAtiva(userId),
  ])

  const porCurso = new Map(matriculas.map((m) => [m.cursoId, m]))
  const concluidas = new Set(progressos.map((p) => p.aulaId))

  return cursos.map((curso) => {
    const matricula = porCurso.get(curso.id)
    const compraValida =
      matricula?.status === "ATIVA" &&
      (!matricula.expiraEm || matricula.expiraEm > agora)

    const temAcesso = papel === "ADMIN" || assinante || !!compraValida
    const motivo: MotivoDeAcesso =
      papel === "ADMIN" ? "ADMIN" : assinante ? "ASSINATURA" : compraValida ? "COMPRA" : "SEM_ACESSO"

    const aulas = curso.modulos.flatMap((m) =>
      m.aulas.map((a) => ({
        ...a,
        moduloTitulo: m.titulo,
        // A amostra gratuita é a única exceção ao portão
        liberada: temAcesso || a.gratuita,
        concluida: concluidas.has(a.id),
      }))
    )

    return {
      curso,
      temAcesso,
      motivo,
      percentual: matricula?.percentualConcluido ?? 0,
      expiraEm: matricula?.expiraEm ?? null,
      aulas,
    }
  })
}

export type ItemDaVitrine = Awaited<ReturnType<typeof listarVitrineDoAluno>>[number]
