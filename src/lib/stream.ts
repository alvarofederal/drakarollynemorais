import { createPrivateKey } from "node:crypto"
import jwt from "jsonwebtoken"

/**
 * Cloudflare Stream — upload e reprodução protegida.
 *
 * Duas coisas acontecem aqui e em nenhum outro lugar:
 *  1. Pedir uma URL de upload de uso único (o arquivo vai do navegador direto
 *     para o Cloudflare, sem passar pelo nosso servidor)
 *  2. Assinar o token de reprodução, depois de a matrícula ter sido conferida
 *
 * Todo vídeo é criado com `requireSignedURLs: true`. Sem isso, o link do vídeo
 * funcionaria para qualquer um que o copiasse.
 */

const API = "https://api.cloudflare.com/client/v4"

/** Validade do token de reprodução. Curta de propósito. */
const VALIDADE_TOKEN_SEGUNDOS = 2 * 60 * 60

type RespostaCf<T> = {
  success: boolean
  result?: T
  errors?: { code: number; message: string }[]
}

function config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_STREAM_TOKEN
  if (!accountId || !token) {
    throw new Error(
      "Cloudflare Stream não configurado: faltam CLOUDFLARE_ACCOUNT_ID ou CLOUDFLARE_STREAM_TOKEN"
    )
  }
  return { accountId, token }
}

async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  const { accountId, token } = config()

  const resposta = await fetch(`${API}/accounts/${accountId}/stream${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  })

  const corpo = (await resposta.json()) as RespostaCf<T>

  if (!resposta.ok || !corpo.success) {
    const detalhe = corpo.errors?.map((e) => `${e.code}: ${e.message}`).join(" · ")
    throw new Error(`Cloudflare Stream (HTTP ${resposta.status}): ${detalhe ?? "erro desconhecido"}`)
  }

  return corpo.result as T
}

/* ─── upload ──────────────────────────────────────────────────── */

export type UploadDireto = { uploadURL: string; uid: string }

/**
 * Cria uma URL de upload de uso único.
 *
 * @param maxDuracaoSegundos teto de duração aceito — evita subir arquivo errado
 * @param meta rótulos livres, úteis para achar o vídeo no painel do Cloudflare
 */
export async function criarUploadDireto(opcoes: {
  maxDuracaoSegundos?: number
  meta?: Record<string, string>
  origensPermitidas?: string[]
}): Promise<UploadDireto> {
  return chamar<UploadDireto>("/direct_upload", {
    method: "POST",
    body: JSON.stringify({
      maxDurationSeconds: opcoes.maxDuracaoSegundos ?? 4 * 60 * 60,
      // A URL de upload em si expira em 1 hora
      expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      requireSignedURLs: true,
      meta: opcoes.meta ?? {},
      ...(opcoes.origensPermitidas ? { allowedOrigins: opcoes.origensPermitidas } : {}),
    }),
  })
}

/* ─── consulta ────────────────────────────────────────────────── */

export type VideoStream = {
  uid: string
  status?: { state?: string; pctComplete?: string; errorReasonText?: string }
  duration?: number
  readyToStream?: boolean
  thumbnail?: string
  size?: number
}

export async function obterVideo(uid: string): Promise<VideoStream> {
  return chamar<VideoStream>(`/${encodeURIComponent(uid)}`)
}

export async function excluirVideo(uid: string): Promise<void> {
  const { accountId, token } = config()
  const resposta = await fetch(`${API}/accounts/${accountId}/stream/${encodeURIComponent(uid)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  // 404 é aceitável: o vídeo já não existe, que é o estado desejado
  if (!resposta.ok && resposta.status !== 404) {
    throw new Error(`Falha ao excluir vídeo no Cloudflare (HTTP ${resposta.status})`)
  }
}

/* ─── reprodução ──────────────────────────────────────────────── */

/**
 * Assina o token de reprodução de um vídeo.
 *
 * ⚠️ Só chame DEPOIS de confirmar a matrícula com `lib/acesso.ts`.
 * Esta função não verifica permissão — ela apenas assina.
 */
export function assinarTokenDeReproducao(
  uid: string,
  opcoes?: { validadeSegundos?: number }
): string {
  const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID
  const jwkBase64 = process.env.CLOUDFLARE_STREAM_KEY_JWK

  if (!keyId || !jwkBase64) {
    throw new Error(
      "Chave de assinatura ausente: rode `npm run stream:chave` para gerar CLOUDFLARE_STREAM_KEY_ID e _JWK"
    )
  }

  // O Cloudflare devolve o JWK como JSON codificado em base64
  const jwk = JSON.parse(Buffer.from(jwkBase64, "base64").toString("utf8"))
  const chavePrivada = createPrivateKey({ key: jwk, format: "jwk" })

  const agora = Math.floor(Date.now() / 1000)
  const validade = opcoes?.validadeSegundos ?? VALIDADE_TOKEN_SEGUNDOS

  return jwt.sign(
    {
      sub: uid,
      kid: keyId,
      exp: agora + validade,
      nbf: agora - 30, // folga para relógio dessincronizado
    },
    chavePrivada,
    { algorithm: "RS256", header: { alg: "RS256", kid: keyId } }
  )
}

function subdominio() {
  const s = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN
  if (!s) throw new Error("NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN não configurado")
  return s
}

/** URL do iframe do player, já com o token assinado embutido. */
export function urlDoPlayer(tokenAssinado: string): string {
  return `https://${subdominio()}/${tokenAssinado}/iframe`
}

/** Manifesto HLS, para quando quisermos usar um player próprio. */
export function urlHls(tokenAssinado: string): string {
  return `https://${subdominio()}/${tokenAssinado}/manifest/video.m3u8`
}

/** Thumbnail do vídeo. Também exige token quando requireSignedURLs está ativo. */
export function urlThumbnail(tokenAssinado: string): string {
  return `https://${subdominio()}/${tokenAssinado}/thumbnails/thumbnail.jpg`
}
