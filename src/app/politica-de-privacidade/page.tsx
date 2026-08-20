import type { Metadata } from "next"
import { PaginaLegal } from "@/app/_components/legal/pagina-legal"
import { marca } from "@/config/landing"

export const metadata: Metadata = {
  title: "Política de privacidade",
  robots: { index: false, follow: true },
}

export default function PoliticaDePrivacidadePage() {
  return (
    <PaginaLegal titulo="Política de privacidade">
      <p>
        Este documento ainda está sendo redigido e precisa ser revisado juridicamente antes
        do lançamento, como exige a LGPD.
      </p>
      <p>
        O que a plataforma coleta hoje: nome, e-mail e senha no cadastro; telefone e CPF
        quando você informa; e o registro de quais aulas você assistiu. O CPF é usado
        exclusivamente para emitir o certificado.
      </p>
      <p>
        Dados de pagamento não passam por nós — o processamento é feito pela Stripe. Os
        vídeos são entregues pelo Cloudflare Stream por meio de links temporários,
        vinculados à sua matrícula.
      </p>
      <p>
        {marca.email
          ? `Para solicitar correção ou exclusão dos seus dados: ${marca.email}`
          : "Para solicitar correção ou exclusão dos seus dados, use o canal de contato do rodapé."}
      </p>
    </PaginaLegal>
  )
}
