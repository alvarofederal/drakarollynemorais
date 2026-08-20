import { describe, expect, it } from "vitest"
import { gerarSlug, gerarSlugUnico } from "@/lib/slug"

describe("gerarSlug", () => {
  it("remove acentos", () => {
    expect(gerarSlug("Cardiologia Avançada")).toBe("cardiologia-avancada")
    expect(gerarSlug("Emergências Clínicas")).toBe("emergencias-clinicas")
    expect(gerarSlug("Coração e Circulação")).toBe("coracao-e-circulacao")
  })

  it("troca pontuação por hífen e não deixa hífen nas pontas", () => {
    expect(gerarSlug("Módulo 1: Introdução!")).toBe("modulo-1-introducao")
    expect(gerarSlug("  espaços  em  volta  ")).toBe("espacos-em-volta")
  })

  it("não gera hífens repetidos", () => {
    expect(gerarSlug("A — B — C")).toBe("a-b-c")
  })

  it("devolve string vazia quando não sobra nada utilizável", () => {
    expect(gerarSlug("!!!")).toBe("")
  })

  it("limita o comprimento", () => {
    expect(gerarSlug("a".repeat(200)).length).toBe(80)
  })
})

describe("gerarSlugUnico", () => {
  it("mantém o slug quando está livre", async () => {
    const r = await gerarSlugUnico("Curso Novo", async () => false)
    expect(r).toBe("curso-novo")
  })

  it("acrescenta sufixo quando já existe", async () => {
    const ocupados = new Set(["curso-novo", "curso-novo-2"])
    const r = await gerarSlugUnico("Curso Novo", async (s) => ocupados.has(s))
    expect(r).toBe("curso-novo-3")
  })

  it("usa um fallback quando o título não gera slug", async () => {
    const r = await gerarSlugUnico("###", async () => false)
    expect(r).toBe("item")
  })
})
