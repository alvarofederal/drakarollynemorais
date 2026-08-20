import "dotenv/config"
import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"
import { PrismaClient } from "../src/generated/prisma"

const db = new PrismaClient()

/**
 * Cria a conta ADMIN da Dra. e o registro de configuração da plataforma.
 *
 * A senha NUNCA fica no código. Ordem de precedência:
 *   1. process.env.ADMIN_PASSWORD, se definida
 *   2. senha aleatória forte, impressa UMA vez no terminal
 *
 * Rodar de novo é seguro: não sobrescreve a senha de um admin que já existe.
 */
async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()

  if (!email) {
    console.error(
      "\n✗ Defina ADMIN_EMAIL no .env antes de rodar o seed.\n" +
        "  Ex.: ADMIN_EMAIL=karollyne@exemplo.com.br\n"
    )
    process.exitCode = 1
    return
  }

  const jaExiste = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  })

  if (jaExiste) {
    if (jaExiste.role !== "ADMIN") {
      await db.user.update({ where: { id: jaExiste.id }, data: { role: "ADMIN" } })
      console.log(`✓ ${email} promovido a ADMIN.`)
    } else {
      console.log(`• ${email} já é ADMIN. Senha preservada.`)
    }
  } else {
    const senhaGerada = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url")
    const senhaHash = await bcrypt.hash(senhaGerada, 12)

    await db.user.create({
      data: {
        name: process.env.ADMIN_NAME ?? "Karollyne Morais",
        email,
        password: senhaHash,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    })

    console.log(`\n✓ Conta ADMIN criada: ${email}`)
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`\n  ┌──────────────────────────────────────────────┐`)
      console.log(`  │ SENHA (aparece só agora, anote):             │`)
      console.log(`  │ ${senhaGerada.padEnd(44)} │`)
      console.log(`  └──────────────────────────────────────────────┘`)
      console.log(`\n  Troque no primeiro acesso.\n`)
    }
  }

  await db.configPlataforma.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", nomeMarca: "Dra. Karollyne Morais" },
  })
  console.log("✓ Configuração da plataforma pronta.")
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
