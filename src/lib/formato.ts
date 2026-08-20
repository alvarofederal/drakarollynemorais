/** Formatação para exibição. Valores monetários são sempre Int em centavos. */

export function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

/** "1h 30min" · "45min" · "—" */
export function formatarDuracao(minutos: number): string {
  if (!minutos) return "—"
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/** Converte "497,00" ou "R$ 497" para 49700 centavos. */
export function precoParaCentavos(entrada: string): number {
  const limpo = entrada.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  const valor = Number.parseFloat(limpo)
  return Number.isFinite(valor) ? Math.round(valor * 100) : 0
}

export function formatarData(data: Date | null | undefined): string {
  if (!data) return "—"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(data)
}
