"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center gap-2 rounded-md border border-km-line px-3.5 py-2 text-sm font-medium text-km-ink-soft transition-colors hover:border-km-brand hover:text-km-brand"
    >
      <LogOut className="size-4" />
      Sair
    </button>
  )
}
