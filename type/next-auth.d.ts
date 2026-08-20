import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "ALUNO"
    } & DefaultSession["user"]
  }

  interface User {
    role?: "ADMIN" | "ALUNO"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "ADMIN" | "ALUNO"
    /** Momento da última revalidação do papel/status contra o banco (epoch ms) */
    checkedAt?: number
  }
}

export {}
