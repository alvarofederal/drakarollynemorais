/**
 * URLs absolutas construídas a partir da origem em que o navegador já está.
 *
 * O NextAuth resolve `callbackUrl` relativo contra `NEXTAUTH_URL`. Se essa
 * variável estiver errada no ambiente — apontando para localhost, por exemplo —
 * o logout e o login social jogam o usuário para fora do site.
 *
 * Passar a URL absoluta da origem atual elimina essa dependência: onde quer que
 * a aplicação esteja rodando, ela volta para ela mesma.
 */
export function urlDaOrigem(caminho = "/"): string {
  if (typeof window === "undefined") return caminho
  return new URL(caminho, window.location.origin).toString()
}
