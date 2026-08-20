import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { headers } from "next/headers"
import bcrypt from "bcryptjs"
import prisma from "./prisma"
import { checkRateLimit } from "./rate-limit"
import { loginSchema } from "./validators/auth"

export const runtime = "nodejs"

/**
 * Intervalo de revalidação do papel e do status do usuário contra o banco.
 *
 * A sessão é JWT — o token carrega `role` e vale 30 dias. Sem revalidação,
 * desativar um aluno ou mudar um papel só teria efeito no próximo login.
 * A cada 5 minutos o token é conferido no banco: se o usuário sumiu ou foi
 * desativado, a sessão morre.
 */
const REVALIDAR_A_CADA_MS = 5 * 60 * 1000

/**
 * Hash válido de bcrypt que nunca corresponde a nada. Serve só para gastar o
 * mesmo tempo de CPU quando a conta não existe — sem isso, a diferença no tempo
 * de resposta revela quais e-mails estão cadastrados.
 */
const HASH_DESCARTAVEL = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO.WjF.pJhL0hPqZ5xN3qKq1oQ5m0Qz0O"

async function ipDaRequisicao(): Promise<string> {
  try {
    const h = await headers()
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "desconhecido"
    )
  } catch {
    // `headers()` não está disponível fora do contexto de requisição
    return "desconhecido"
  }
}

async function registrarTentativa(email: string, ipAddress: string, success: boolean) {
  await prisma.loginAttempt
    .create({ data: { email, ipAddress, success } })
    .catch(() => {
      /* auditoria nunca bloqueia o login */
    })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // renova o token uma vez por dia
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const ip = await ipDaRequisicao()

        // Freio de força bruta: por e-mail e por IP, em janelas separadas.
        // Por e-mail impede martelar uma conta específica; por IP impede
        // varrer muitas contas a partir da mesma origem.
        const [porEmail, porIp] = await Promise.all([
          checkRateLimit(`login:email:${email}`, 10, 15 * 60 * 1000),
          checkRateLimit(`login:ip:${ip}`, 30, 15 * 60 * 1000),
        ])

        if (!porEmail.allowed || !porIp.allowed) {
          await registrarTentativa(email, ip, false)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            role: true,
            ativo: true,
          },
        })

        // Mesma resposta para "não existe", "sem senha" e "senha errada":
        // não entregamos ao atacante a informação de quais e-mails existem.
        if (!user?.password) {
          // Compara mesmo assim para não vazar a existência da conta pelo tempo de resposta
          await bcrypt.compare(password, HASH_DESCARTAVEL)
          await registrarTentativa(email, ip, false)
          return null
        }

        if (!user.ativo) {
          await registrarTentativa(email, ip, false)
          return null
        }

        const senhaConfere = await bcrypt.compare(password, user.password)
        if (!senhaConfere) {
          await registrarTentativa(email, ip, false)
          return null
        }

        await registrarTentativa(email, ip, true)
        await prisma.user.update({
          where: { id: user.id },
          data: { ultimoAcesso: new Date() },
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Primeiro login: grava id e papel no token
      if (user?.id) {
        token.id = user.id
        token.role = (user.role as "ADMIN" | "ALUNO") ?? "ALUNO"
        token.checkedAt = Date.now()
        return token
      }

      const conferidoEm = typeof token.checkedAt === "number" ? token.checkedAt : 0
      const vencido = Date.now() - conferidoEm > REVALIDAR_A_CADA_MS

      if (trigger === "update" || vencido) {
        const atual = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, ativo: true },
        })

        // Usuário removido ou desativado → derruba a sessão
        if (!atual || !atual.ativo) return null

        token.role = atual.role
        token.checkedAt = Date.now()
      }

      return token
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        session.user.role = (token.role as "ADMIN" | "ALUNO") ?? "ALUNO"
      }
      return session
    },

    async signIn({ user, account }) {
      // No login social, o e-mail já vem verificado pelo provedor
      if (account?.provider === "google" && user.email) {
        await prisma.user.updateMany({
          where: { email: user.email, emailVerified: null },
          data: { emailVerified: new Date() },
        })
      }
      return true
    },
  },

  events: {
    async signIn({ user }) {
      if (!user.id) return
      await prisma.logEvento
        .create({ data: { userId: user.id, tipo: "LOGIN" } })
        .catch(() => {
          /* auditoria nunca bloqueia o login */
        })
    },
  },
})
