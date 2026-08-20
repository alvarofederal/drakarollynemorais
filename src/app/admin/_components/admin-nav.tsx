"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ITENS = [
  { rotulo: "Visão geral", href: "/admin" },
  { rotulo: "Cursos", href: "/admin/cursos" },
  { rotulo: "Alunos", href: "/admin/alunos" },
] as const

export function AdminNav() {
  const caminho = usePathname()

  return (
    <nav
      className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-5 sm:px-8"
      aria-label="Seções do painel"
    >
      {ITENS.map((item) => {
        // "/admin" só fica ativo no caminho exato; as demais cobrem subrotas
        const ativo =
          item.href === "/admin" ? caminho === "/admin" : caminho.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-3 text-sm whitespace-nowrap transition-colors",
              ativo
                ? "border-km-brand font-medium text-km-brand"
                : "border-transparent text-km-ink-soft hover:text-km-ink"
            )}
          >
            {item.rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
