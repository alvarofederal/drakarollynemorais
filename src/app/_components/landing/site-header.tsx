"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Menu, X } from "lucide-react"
import { marca, navegacao } from "@/config/landing"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-baseline gap-2 font-display text-km-ink",
        className
      )}
      aria-label={`${marca.nome} — página inicial`}
    >
      <span className="text-lg leading-none font-semibold tracking-tight sm:text-xl">
        Karollyne&nbsp;Morais
      </span>
      <span
        aria-hidden
        className="hidden h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-km-brand sm:block"
      />
    </Link>
  )
}

export function SiteHeader() {
  const [aberto, setAberto] = useState(false)
  const [rolou, setRolou] = useState(false)

  // O cabeçalho aparece em páginas públicas e em páginas de quem já entrou.
  // Sem isto, um aluno logado via "Entrar" e achava que tinha caído fora.
  const { data: sessao, status } = useSession()
  const logado = status === "authenticated"
  const ehAdmin = sessao?.user?.role === "ADMIN"
  const hrefDaArea = ehAdmin ? "/admin" : "/aluno"
  const rotuloDaArea = ehAdmin ? "Painel" : "Minha área"

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 8)
    aoRolar()
    window.addEventListener("scroll", aoRolar, { passive: true })
    return () => window.removeEventListener("scroll", aoRolar)
  }, [])

  // trava o scroll do corpo enquanto o menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [aberto])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        rolou
          ? "border-km-line bg-km-bg/90 backdrop-blur-md"
          : "border-transparent bg-km-bg"
      )}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-6 px-5 sm:h-20 sm:px-8">
        <Wordmark />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Seções da página">
          {navegacao.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-km-ink-soft transition-colors hover:text-km-brand"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {status === "loading" ? (
            // Espaço reservado para não piscar "Entrar" antes de saber quem é
            <div className="h-9 w-32" aria-hidden />
          ) : logado ? (
            <Link
              href={hrefDaArea}
              className="inline-flex items-center gap-2 rounded-md bg-km-brand px-4 py-2.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
            >
              <LayoutDashboard className="size-4" />
              {rotuloDaArea}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-km-ink transition-colors hover:text-km-brand"
              >
                Entrar
              </Link>
              <Link
                href="/#cursos"
                className="rounded-md bg-km-brand px-4 py-2.5 text-sm font-medium text-km-on-brand transition-colors hover:bg-km-brand-hover"
              >
                Ver os cursos
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            className="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-km-ink"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          >
            {aberto ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {aberto && (
        <div
          id="menu-mobile"
          className="fixed inset-0 top-16 z-50 flex flex-col bg-km-bg px-5 pb-10 md:hidden"
        >
          <nav className="flex flex-col divide-y divide-km-line-soft" aria-label="Seções da página">
            {navegacao.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setAberto(false)}
                className="py-4 font-display text-xl text-km-ink"
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            {logado ? (
              <Link
                href={hrefDaArea}
                onClick={() => setAberto(false)}
                className="rounded-md bg-km-brand px-4 py-3 text-center text-sm font-medium text-km-on-brand"
              >
                {rotuloDaArea}
              </Link>
            ) : (
              <>
                <Link
                  href="/#cursos"
                  onClick={() => setAberto(false)}
                  className="rounded-md bg-km-brand px-4 py-3 text-center text-sm font-medium text-km-on-brand"
                >
                  Ver os cursos
                </Link>
                <Link
                  href="/login"
                  onClick={() => setAberto(false)}
                  className="rounded-md border border-km-line px-4 py-3 text-center text-sm font-medium text-km-ink"
                >
                  Entrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
