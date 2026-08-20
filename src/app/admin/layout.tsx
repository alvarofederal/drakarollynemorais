import { exigirAdmin } from "@/lib/acesso"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wordmark } from "@/app/_components/landing/site-header"
import { SignOutButton } from "@/app/_components/auth/sign-out-button"
import { AdminNav } from "./_components/admin-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Portão do painel inteiro — nenhuma subpágina precisa repetir esta checagem
  await exigirAdmin()

  return (
    <div className="min-h-dvh bg-km-bg text-km-ink">
      <header className="sticky top-0 z-40 border-b border-km-line bg-km-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="hidden rounded-md bg-km-brand-soft px-2 py-0.5 font-mono text-[10px] tracking-wider text-km-brand uppercase sm:inline">
              Painel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
        <AdminNav />
      </header>

      <main className="mx-auto w-full px-5 py-10 sm:px-8 sm:py-12">{children}</main>
    </div>
  )
}
