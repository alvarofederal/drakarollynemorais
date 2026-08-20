"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "km-theme"

/**
 * Seletor de tema. O padrão da plataforma é escuro — ver o script em
 * `src/app/layout.tsx`, que aplica a classe `.dark` antes da hidratação.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [escuro, setEscuro] = useState(true)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    // Lê o estado real do DOM, já definido pelo script do <head>
    setEscuro(document.documentElement.classList.contains("dark"))
    setMontado(true)
  }, [])

  function alternar() {
    const proximo = !escuro
    setEscuro(proximo)
    document.documentElement.classList.toggle("dark", proximo)
    localStorage.setItem(STORAGE_KEY, proximo ? "dark" : "light")
  }

  // Espaço reservado do mesmo tamanho, para não deslocar o layout
  if (!montado) return <div className={cn("size-9", className)} aria-hidden />

  return (
    <button
      type="button"
      onClick={alternar}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md text-km-ink-soft transition-colors hover:bg-km-sunk hover:text-km-ink",
        className
      )}
      aria-label={escuro ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={escuro ? "Tema claro" : "Tema escuro"}
    >
      {escuro ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}
