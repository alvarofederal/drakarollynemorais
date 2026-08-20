import type { Metadata } from "next"
import { PaginaLegal } from "@/app/_components/legal/pagina-legal"
import { marca } from "@/config/landing"

export const metadata: Metadata = {
  title: "Termos de uso",
  robots: { index: false, follow: true },
}

export default function TermosDeUsoPage() {
  return (
    <PaginaLegal titulo="Termos de uso">
      <p>
        Este documento ainda está sendo redigido. Ele vai descrever as condições de uso da
        plataforma, as regras de acesso aos cursos, a política de reembolso e as
        responsabilidades de cada parte.
      </p>
      <p>
        Enquanto isso, valem as condições informadas no momento da contratação e o que
        determina o Código de Defesa do Consumidor — inclusive o direito de arrependimento
        em até 7 dias para compras feitas pela internet.
      </p>
      <p>
        {marca.email
          ? `Dúvidas: ${marca.email}`
          : "Para dúvidas, use o canal de contato informado no rodapé."}
      </p>
    </PaginaLegal>
  )
}
