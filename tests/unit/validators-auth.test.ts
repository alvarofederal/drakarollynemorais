import { describe, expect, it } from "vitest"
import { loginSchema, registerSchema } from "@/lib/validators/auth"

describe("registerSchema", () => {
  const valido = { name: "Karollyne Morais", email: "Teste@Exemplo.COM", password: "senha1234" }

  it("aceita um cadastro válido", () => {
    const r = registerSchema.safeParse(valido)
    expect(r.success).toBe(true)
  })

  it("normaliza o e-mail para minúsculas e sem espaços", () => {
    const r = registerSchema.parse({ ...valido, email: "  Teste@Exemplo.COM  " })
    expect(r.email).toBe("teste@exemplo.com")
  })

  it("recusa senha com menos de 8 caracteres", () => {
    const r = registerSchema.safeParse({ ...valido, password: "abc123" })
    expect(r.success).toBe(false)
  })

  it("recusa senha só com letras", () => {
    const r = registerSchema.safeParse({ ...valido, password: "senhasenha" })
    expect(r.success).toBe(false)
  })

  it("recusa senha só com números", () => {
    const r = registerSchema.safeParse({ ...valido, password: "12345678" })
    expect(r.success).toBe(false)
  })

  it("aceita senha longa sem símbolo — comprimento vale mais que composição", () => {
    const r = registerSchema.safeParse({ ...valido, password: "meucursodemedicina2026" })
    expect(r.success).toBe(true)
  })

  it("recusa e-mail inválido", () => {
    const r = registerSchema.safeParse({ ...valido, email: "nao-e-email" })
    expect(r.success).toBe(false)
  })

  it("recusa nome vazio", () => {
    const r = registerSchema.safeParse({ ...valido, name: " " })
    expect(r.success).toBe(false)
  })
})

describe("loginSchema", () => {
  it("não aplica política de senha no login", () => {
    // Contas antigas podem ter senha fora da política atual — o login só exige preenchimento
    const r = loginSchema.safeParse({ email: "a@b.com", password: "x" })
    expect(r.success).toBe(true)
  })

  it("exige senha preenchida", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" })
    expect(r.success).toBe(false)
  })
})
