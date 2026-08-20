/**
 * tests/helpers/db.ts
 * Utilitários de banco para os testes de integração.
 *
 * Todo registro criado em teste leva `process.env.TEST_PREFIX` no e-mail ou no
 * slug, para que a limpeza consiga distinguir dado de teste de dado real.
 */
import { PrismaClient } from "../../src/generated/prisma"

export const db = new PrismaClient({ log: [] })

export function prefixo() {
  return process.env.TEST_PREFIX ?? "TEST_"
}

export function emailDeTeste(nome = "aluno") {
  return `${prefixo()}${nome}@teste.local`.toLowerCase()
}

export async function criarAluno(nome = "aluno") {
  return db.user.create({
    data: {
      name: `Aluno de teste ${nome}`,
      email: emailDeTeste(nome),
      password: "$2a$12$hashfalsoparateste000000000000000000000000000000000000",
      role: "ALUNO",
    },
  })
}

export async function criarCursoPublicado(slugBase = "curso") {
  const slug = `${prefixo()}${slugBase}`.toLowerCase()
  return db.curso.create({
    data: {
      slug,
      titulo: `Curso de teste ${slugBase}`,
      status: "PUBLICADO",
      publicadoEm: new Date(),
      precoCentavos: 49700,
      cargaHorariaMinutos: 120,
    },
  })
}

/** Remove tudo que este processo de teste criou. Ordem respeita as dependências. */
export async function limpar() {
  const p = prefixo()

  const usuarios = await db.user.findMany({
    where: { email: { startsWith: p.toLowerCase() } },
    select: { id: true },
  })
  const cursos = await db.curso.findMany({
    where: { slug: { startsWith: p.toLowerCase() } },
    select: { id: true },
  })

  const userIds = usuarios.map((u) => u.id)
  const cursoIds = cursos.map((c) => c.id)

  if (userIds.length === 0 && cursoIds.length === 0) return

  await db.certificado.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { cursoId: { in: cursoIds } }] },
  })
  await db.progressoAula.deleteMany({ where: { userId: { in: userIds } } })
  await db.matricula.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { cursoId: { in: cursoIds } }] },
  })
  await db.pedido.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { cursoId: { in: cursoIds } }] },
  })
  await db.logEvento.deleteMany({ where: { userId: { in: userIds } } })
  await db.authToken.deleteMany({ where: { userId: { in: userIds } } })

  await db.material.deleteMany({ where: { cursoId: { in: cursoIds } } })
  await db.aula.deleteMany({ where: { modulo: { cursoId: { in: cursoIds } } } })
  await db.modulo.deleteMany({ where: { cursoId: { in: cursoIds } } })
  await db.curso.deleteMany({ where: { id: { in: cursoIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })
}
