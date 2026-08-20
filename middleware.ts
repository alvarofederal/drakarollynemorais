import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Primeira barreira de acesso: só confere a presença do cookie de sessão.
 * NÃO decide papel nem valida o token — isso é feito no servidor, em cada
 * página, com `auth()`. Middleware roda no Edge e não fala com o Prisma.
 */

const ROTAS_PUBLICAS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth",
  "/cursos",
  "/professores",
  "/certificados",
  "/termos-de-uso",
  "/politica-de-privacidade",
]

/**
 * Arquivos que os buscadores e o navegador pedem na raiz. Precisam responder
 * sem sessão — o `matcher` abaixo não os exclui, então a lista é aqui.
 */
const ARQUIVOS_PUBLICOS = [
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/opengraph-image",
  "/apple-icon",
  "/icon",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const ehPublica =
    pathname === "/" ||
    ARQUIVOS_PUBLICOS.some((arquivo) => pathname.startsWith(arquivo)) ||
    ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota))

  if (ehPublica) return NextResponse.next()

  const cookieSessao =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!cookieSessao) {
    const url = new URL("/login", request.url)
    // Preserva o destino para voltar depois do login
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
