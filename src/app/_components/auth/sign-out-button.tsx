"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Loader2, LogOut } from "lucide-react"

export function SignOutButton() {
  const [saindo, setSaindo] = useState(false)

  async function sair() {
    setSaindo(true)
    // `redirect: false` e navegação manual: assim o destino é sempre a origem
    // atual, e não o que estiver em NEXTAUTH_URL.
    await signOut({ redirect: false })
    window.location.href = "/"
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="inline-flex items-center gap-2 rounded-md border border-km-line px-3.5 py-2 text-sm font-medium text-km-ink-soft transition-colors hover:border-km-brand hover:text-km-brand disabled:opacity-60"
    >
      {saindo ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Sair
    </button>
  )
}
