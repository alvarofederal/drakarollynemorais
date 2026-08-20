import type { MetadataRoute } from "next"
import { marca, permitirIndexacao } from "@/config/landing"

/**
 * Enquanto `NEXT_PUBLIC_PERMITIR_INDEXACAO` não for "true", o site inteiro fica
 * fora dos buscadores. É proteção deliberada: a landing ainda tem texto de
 * preenchimento sobre uma médica real, e conteúdo assim indexado é difícil de
 * tirar do índice depois.
 */
export default function robots(): MetadataRoute.Robots {
  if (!permitirIndexacao) {
    return { rules: [{ userAgent: "*", disallow: "/" }] }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas autenticadas nunca são indexadas
        disallow: ["/admin", "/aluno", "/api", "/apos-login"],
      },
    ],
    sitemap: `${marca.dominio}/sitemap.xml`,
  }
}
