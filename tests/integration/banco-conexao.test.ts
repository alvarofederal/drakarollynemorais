import { afterAll, describe, expect, it } from "vitest"
import { criarAluno, criarCursoPublicado, db, limpar } from "../helpers/db"

afterAll(async () => {
  await limpar()
  await db.$disconnect()
})

describe("conexão e schema do banco", () => {
  it("conecta no banco", async () => {
    const resultado = await db.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`
    expect(resultado[0].ok).toBe(1)
  })

  it("tem todas as tabelas do domínio criadas", async () => {
    const linhas = await db.$queryRaw<{ TABLE_NAME: string }[]>`
      SELECT TABLE_NAME FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()`
    const tabelas = linhas.map((l) => l.TABLE_NAME)

    const esperadas = [
      "users",
      "accounts",
      "auth_tokens",
      "cursos",
      "modulos",
      "aulas",
      "materiais",
      "matriculas",
      "progresso_aulas",
      "certificados",
      "pedidos",
      "professores",
      "logs_eventos",
    ]

    for (const tabela of esperadas) {
      expect(tabelas, `tabela ausente: ${tabela}`).toContain(tabela)
    }
  })
})

describe("regras do schema", () => {
  it("cria usuário com papel ALUNO por padrão", async () => {
    const aluno = await criarAluno("padrao")
    expect(aluno.role).toBe("ALUNO")
    expect(aluno.ativo).toBe(true)
  })

  it("impede matrícula duplicada do mesmo aluno no mesmo curso", async () => {
    const aluno = await criarAluno("dup")
    const curso = await criarCursoPublicado("dup")

    await db.matricula.create({ data: { userId: aluno.id, cursoId: curso.id } })

    await expect(
      db.matricula.create({ data: { userId: aluno.id, cursoId: curso.id } })
    ).rejects.toThrow()
  })

  it("nasce com matrícula ATIVA e progresso zerado", async () => {
    const aluno = await criarAluno("ativa")
    const curso = await criarCursoPublicado("ativa")

    const matricula = await db.matricula.create({
      data: { userId: aluno.id, cursoId: curso.id },
    })

    expect(matricula.status).toBe("ATIVA")
    expect(matricula.percentualConcluido).toBe(0)
    // Nulo = vitalício
    expect(matricula.expiraEm).toBeNull()
  })

  it("curso nasce como RASCUNHO", async () => {
    const curso = await db.curso.create({
      data: { slug: `${process.env.TEST_PREFIX}rascunho`.toLowerCase(), titulo: "Rascunho" },
    })
    expect(curso.status).toBe("RASCUNHO")
  })
})
