import "dotenv/config"
import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * Cria a chave de assinatura do Cloudflare Stream e grava o resultado no .env.
 *
 * É essa chave que permite gerar tokens de reprodução com validade curta —
 * sem ela, o vídeo só tocaria por URL pública.
 *
 * O segredo é escrito direto no arquivo: nunca é impresso no terminal, para
 * não vazar em histórico de shell, screenshot ou log.
 *
 *   npm run stream:chave
 */

const CAMINHO_ENV = resolve(process.cwd(), ".env")

function mascarar(valor: string) {
  if (valor.length <= 8) return "•".repeat(valor.length)
  return `${valor.slice(0, 4)}${"•".repeat(12)}${valor.slice(-4)}`
}

/** Substitui a linha CHAVE=... no .env, ou acrescenta se não existir. */
function gravarNoEnv(pares: Record<string, string>) {
  let conteudo = readFileSync(CAMINHO_ENV, "utf8")

  for (const [chave, valor] of Object.entries(pares)) {
    const linha = `${chave}=${valor}`
    const padrao = new RegExp(`^${chave}=.*$`, "m")
    conteudo = padrao.test(conteudo) ? conteudo.replace(padrao, linha) : `${conteudo}\n${linha}`
  }

  writeFileSync(CAMINHO_ENV, conteudo, "utf8")
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim()
  const token = process.env.CLOUDFLARE_STREAM_TOKEN?.trim()

  if (!accountId) {
    console.error("\n✗ CLOUDFLARE_ACCOUNT_ID não está no .env\n")
    process.exitCode = 1
    return
  }

  if (!token) {
    console.error(
      "\n✗ CLOUDFLARE_STREAM_TOKEN está vazio no .env\n\n" +
        "  Crie o token em: My Profile → API Tokens → Create Custom Token\n" +
        "  Permissão necessária: Account · Stream · Edit\n"
    )
    process.exitCode = 1
    return
  }

  if (process.env.CLOUDFLARE_STREAM_KEY_ID?.trim()) {
    console.log(
      "\n• Já existe uma chave de assinatura no .env.\n" +
        "  Apague CLOUDFLARE_STREAM_KEY_ID e CLOUDFLARE_STREAM_KEY_JWK se quiser gerar outra.\n"
    )
    return
  }

  console.log("\n→ Criando chave de assinatura no Cloudflare Stream…")

  const resposta = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/keys`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } }
  )

  const corpo = (await resposta.json()) as {
    success: boolean
    result?: { id?: string; jwk?: string }
    errors?: { code: number; message: string }[]
  }

  if (!resposta.ok || !corpo.success) {
    const detalhe = corpo.errors?.map((e) => `${e.code}: ${e.message}`).join(" · ")
    console.error(`\n✗ O Cloudflare recusou a requisição (HTTP ${resposta.status}).`)
    console.error(`  ${detalhe ?? "sem detalhes"}\n`)
    if (resposta.status === 403 || resposta.status === 401) {
      console.error("  Provável causa: o token não tem a permissão Stream · Edit.\n")
    }
    process.exitCode = 1
    return
  }

  const { id, jwk } = corpo.result ?? {}
  if (!id || !jwk) {
    console.error("\n✗ A resposta veio sem `id` ou `jwk`. Nada foi gravado.\n")
    process.exitCode = 1
    return
  }

  gravarNoEnv({
    CLOUDFLARE_STREAM_KEY_ID: id,
    CLOUDFLARE_STREAM_KEY_JWK: jwk,
  })

  console.log("\n✓ Chave criada e gravada no .env")
  console.log(`  CLOUDFLARE_STREAM_KEY_ID  = ${mascarar(id)}`)
  console.log(`  CLOUDFLARE_STREAM_KEY_JWK = ${mascarar(jwk)}`)
  console.log(
    "\n  Faça um backup do .env num lugar seguro: o JWK não é exibido de novo\n" +
      "  pelo Cloudflare. Perdê-lo significa gerar outra chave.\n"
  )
}

main().catch((e) => {
  console.error("\n✗ Falha inesperada:", e instanceof Error ? e.message : e, "\n")
  process.exitCode = 1
})
