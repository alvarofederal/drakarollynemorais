// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans, Spectral } from "next/font/google";
import "./globals.css";
import { SessionAuthProvider } from "@/components/session-auth";
import { QueryClientContext } from "@/providers/queryclient";
import { Toaster } from "sonner";
import { marca } from "@/config/landing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Mantida para as telas legadas do painel, que ainda referenciam esta variável
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

// Face de display da marca — títulos da landing e da área pública
const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(marca.dominio),
  title: {
    default: `${marca.nome} — Cursos para médicos e residentes`,
    template: `%s | ${marca.nome}`,
  },
  description:
    "Cursos online com aulas em vídeo, slides e materiais para baixar. Estude no seu ritmo, pelo celular, e receba certificado de conclusão.",
  keywords: [
    "cursos para médicos",
    "educação médica continuada",
    "curso online medicina",
    "residência médica",
    "certificado curso médico",
  ],
  authors: [{ name: marca.nome, url: marca.dominio }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: marca.dominio,
    siteName: marca.nome,
    title: `${marca.nome} — Cursos para médicos e residentes`,
    description:
      "Aulas em vídeo com slides e materiais para baixar, acesso pelo celular e certificado de conclusão.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${marca.nome} — Cursos para médicos e residentes`,
    description:
      "Aulas em vídeo com slides e materiais para baixar, acesso pelo celular e certificado de conclusão.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Script injetado no <head> — executa ANTES do React hidratar.
// Lê a preferência salva e aplica a classe .dark no <html> imediatamente,
// evitando o flash de tema errado na primeira renderização.
//
// O padrão da plataforma é ESCURO: só sai do escuro quem escolheu "claro"
// explicitamente no seletor de tema.
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('km-theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {
    document.documentElement.classList.add('dark');
  }
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // As variáveis de fonte ficam no <html>, não no <body>: o bloco @theme do
  // Tailwind emite --font-display em :root, e ele precisa enxergar
  // --font-spectral no mesmo escopo para resolver.
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${spectral.variable}`}
      suppressHydrationWarning
    >
      {/* Script de tema roda antes da hidratação — sem flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SessionAuthProvider>
          <QueryClientContext>
            {children}
            <Toaster position="top-right" richColors duration={2500} />
          </QueryClientContext>
        </SessionAuthProvider>
      </body>
    </html>
  );
}
