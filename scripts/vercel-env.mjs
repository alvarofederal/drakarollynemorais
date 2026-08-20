#!/usr/bin/env node
/**
 * Envia as variáveis de ambiente do .env local para a Vercel.
 *
 * Os valores são lidos do arquivo e entregues ao CLI da Vercel pela entrada
 * padrão — nunca aparecem no terminal, no histórico do shell nem em log algum.
 * A saída mostra só o NOME de cada variável.
 *
 *   vercel login          (uma vez)
 *   vercel link           (uma vez, vincula esta pasta ao projeto)
 *   node scripts/vercel-env.mjs
 *
 * Rodar de novo é seguro: sobrescreve o valor anterior de cada variável.
 */
import { execFileSync, spawnSync } from "node:child_process"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const AMBIENTES = ["production", "preview", "development"]

/** Variáveis que a aplicação precisa em produção. */
const NECESSARIAS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_STREAM_TOKEN",
  "CLOUDFLARE_STREAM_KEY_ID",
  "CLOUDFLARE_STREAM_KEY_JWK",
  "NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN",
  "CLOUDINARY_NAME",
  "CLOUDINARY_KEY",
  "CLOUDINARY_SECRET",
  "RESEND_API_KEY",
  "CRON_SECRET",
]

/** Opcionais: só sobem se estiverem preenchidas no .env. */
const OPCIONAIS = [
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLIC_KEY",
  "STRIPE_SECRET_WEBHOOK_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
]

function lerEnv(caminho) {
  const mapa = new Map()
  for (const linha of readFileSync(caminho, "utf8").split(/\r?\n/)) {
    const limpa = linha.trim()
    if (!limpa || limpa.startsWith("#")) continue
    const igual = limpa.indexOf("=")
    if (igual === -1) continue
    const nome = limpa.slice(0, igual).trim()
    let valor = limpa.slice(igual + 1).trim()
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1)
    }
    if (valor) mapa.set(nome, valor)
  }
  return mapa
}

function enviar(nome, valor, ambiente) {
  // O valor vai por stdin: não entra na linha de comando, logo não vaza
  // para a lista de processos nem para o histórico do shell.
  const r = spawnSync("npx", ["vercel", "env", "add", nome, ambiente, "--force"], {
    input: valor,
    encoding: "utf8",
    shell: process.platform === "win32",
  })
  return r.status === 0
}

function main() {
  const caminhoEnv = resolve(process.cwd(), ".env")
  if (!existsSync(caminhoEnv)) {
    console.error("\n✗ .env não encontrado nesta pasta.\n")
    process.exit(1)
  }

  try {
    const quem = execFileSync("npx", ["vercel", "whoami"], {
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    console.log(`\n→ Conectado à Vercel como: ${quem}`)
  } catch {
    console.error("\n✗ CLI da Vercel não autenticado. Rode primeiro:\n")
    console.error("    npx vercel login")
    console.error("    npx vercel link\n")
    process.exit(1)
  }

  const env = lerEnv(caminhoEnv)

  // A URL pública muda entre local e produção. A Vercel injeta VERCEL_URL
  // sozinha, mas o NextAuth precisa da URL canônica explícita.
  const urlProducao = process.argv[2]
  if (urlProducao) {
    env.set("NEXTAUTH_URL", urlProducao)
    env.set("NEXT_PUBLIC_URL", urlProducao)
    env.set("NEXT_PUBLIC_APP_URL", urlProducao)
    console.log(`→ URL de produção: ${urlProducao}`)
  } else {
    console.log("→ Sem URL informada; NEXTAUTH_URL/NEXT_PUBLIC_URL não serão alterados.")
    console.log("  Uso: node scripts/vercel-env.mjs https://seu-projeto.vercel.app")
  }

  const aEnviar = [
    ...NECESSARIAS,
    ...OPCIONAIS,
    ...(urlProducao ? ["NEXTAUTH_URL", "NEXT_PUBLIC_URL", "NEXT_PUBLIC_APP_URL"] : []),
  ]

  const faltando = NECESSARIAS.filter((n) => !env.has(n))
  if (faltando.length) {
    console.error(`\n✗ Faltam no .env: ${faltando.join(", ")}\n`)
    process.exit(1)
  }

  console.log("\n→ Enviando variáveis (valores nunca são exibidos)…\n")

  let enviadas = 0
  let puladas = 0

  for (const nome of [...new Set(aEnviar)]) {
    const valor = env.get(nome)
    if (!valor) {
      console.log(`  ·  ${nome} — vazio no .env, pulado`)
      puladas++
      continue
    }
    const ok = AMBIENTES.every((amb) => enviar(nome, valor, amb))
    console.log(`  ${ok ? "✓" : "✗"}  ${nome}`)
    if (ok) enviadas++
  }

  console.log(`\n${enviadas} variáveis enviadas, ${puladas} puladas.`)
  console.log("\nAgora rode um novo deploy para elas valerem:")
  console.log("    npx vercel --prod\n")
}

main()
