import Link from "next/link"
import { Instagram, Mail, MessageCircle } from "lucide-react"
import { marca, navegacao } from "@/config/landing"

export function SiteFooter() {
  const ano = new Date().getFullYear()

  return (
    <footer className="border-t border-km-line bg-km-bg">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="flex max-w-xs flex-col gap-3">
            <span className="font-display text-lg font-semibold text-km-ink">
              Karollyne Morais
            </span>
            <p className="text-sm leading-relaxed text-km-ink-soft">
              Cursos online para médicos, residentes e estudantes de medicina.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <nav className="flex flex-col gap-3" aria-label="Navegação do rodapé">
              <h2 className="font-mono text-xs tracking-[0.12em] text-km-ink-faint uppercase">
                Navegar
              </h2>
              {navegacao.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-km-ink-soft transition-colors hover:text-km-brand"
                >
                  {item.rotulo}
                </a>
              ))}
              <Link
                href="/login"
                className="text-sm text-km-ink-soft transition-colors hover:text-km-brand"
              >
                Entrar
              </Link>
            </nav>

            <div className="flex flex-col gap-3">
              <h2 className="font-mono text-xs tracking-[0.12em] text-km-ink-faint uppercase">
                Contato
              </h2>
              {/* TODO: preencher `marca.whatsapp`, `marca.instagram` e `marca.email` */}
              {marca.whatsapp && (
                <a
                  href={`https://wa.me/${marca.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-km-ink-soft transition-colors hover:text-km-brand"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              )}
              {marca.instagram && (
                <a
                  href={`https://instagram.com/${marca.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-km-ink-soft transition-colors hover:text-km-brand"
                >
                  <Instagram className="size-4" />
                  Instagram
                </a>
              )}
              {marca.email && (
                <a
                  href={`mailto:${marca.email}`}
                  className="inline-flex items-center gap-2 text-sm text-km-ink-soft transition-colors hover:text-km-brand"
                >
                  <Mail className="size-4" />
                  E-mail
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-km-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-km-ink-faint">
            © {ano} {marca.razaoSocial || marca.nome}
            {marca.cnpj && ` · CNPJ ${marca.cnpj}`}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/termos-de-uso"
              className="font-mono text-xs text-km-ink-faint transition-colors hover:text-km-brand"
            >
              Termos de uso
            </Link>
            <Link
              href="/politica-de-privacidade"
              className="font-mono text-xs text-km-ink-faint transition-colors hover:text-km-brand"
            >
              Política de privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
