/**
 * Geração de slug para URLs públicas.
 * Acentos viram a letra sem acento; o resto vira hífen.
 */

// Faixa de diacríticos combinantes (acentos que o NFD separa da letra).
// Escrita com escape Unicode de propósito: os caracteres literais são
// invisíveis no editor e quebram em qualquer ferramenta que reprocesse o arquivo.
const DIACRITICOS = /[̀-ͯ]/g

export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/**
 * Garante unicidade acrescentando um sufixo numérico.
 * `jaExiste` consulta o banco — a checagem fica com quem chama, para este
 * módulo não depender do Prisma.
 */
export async function gerarSlugUnico(
  texto: string,
  jaExiste: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = gerarSlug(texto) || "item"
  let candidato = base

  for (let i = 2; await jaExiste(candidato); i++) {
    candidato = `${base}-${i}`
    if (i > 100) {
      candidato = `${base}-${Date.now()}`
      break
    }
  }

  return candidato
}
