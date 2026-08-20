// src/lib/validators/auth.ts
import { z } from "zod"

/**
 * Política de senha.
 *
 * Segue a orientação atual do NIST (SP 800-63B): comprimento importa mais do que
 * regras de composição. Exigir maiúscula + símbolo empurra o usuário para
 * "Senha@123" e para o post-it — piora a segurança real e atrapalha o cadastro.
 *
 * O que efetivamente protege aqui: bcrypt com custo 12, limite de tentativas por
 * IP e por e-mail, e sessão JWT revalidada contra o banco.
 */
const senhaSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128, "A senha deve ter no máximo 128 caracteres")
  .regex(/[a-zA-Z]/, "A senha deve conter pelo menos uma letra")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")

// A ordem importa: no Zod as checagens rodam na sequência declarada.
// Normalizar antes de validar evita rejeitar quem cola o e-mail com espaço.
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo")

const nomeSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome")
  .max(120, "Nome muito longo")

export const registerSchema = z.object({
  name: nomeSchema,
  email: emailSchema,
  password: senhaSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha"),
})

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, "O código deve ter 6 dígitos"),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
  password: senhaSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
