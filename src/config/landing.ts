/**
 * Conteúdo da landing page — fonte única de verdade.
 *
 * ⚠️  ATENÇÃO ANTES DE PUBLICAR
 *
 * Os campos marcados com `TODO` contêm afirmações sobre a Dra. Karollyne
 * (formação, CRM, números de alunos, depoimentos). Eles estão VAZIOS ou entre
 * colchetes de propósito — nada aqui foi inventado, e nada disso pode ir ao ar
 * sem os dados reais informados por ela.
 *
 * As seções `numeros`, `depoimentos` e `cursos` não são renderizadas enquanto
 * estiverem vazias. A página continua completa sem elas.
 *
 * Contexto regulatório: publicidade médica é regulada pela Resolução CFM
 * nº 2.336/2023 — sem promessa de resultado, sem sensacionalismo, com nome,
 * CRM e RQE identificados. Ver `spec.md` → Parte 14.
 */

/**
 * Endereço base do site.
 *
 * Ordem: variável explícita → URL que a Vercel injeta no deploy → localhost.
 * Sem isso, uma prévia na Vercel geraria links canônicos apontando para um
 * domínio que ainda não existe.
 */
function enderecoBase() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

/**
 * Indexação por buscadores é opt-in explícito.
 *
 * Enquanto a landing tiver texto de preenchimento sobre a Dra. (especialidade,
 * CRM, bio), ela NÃO pode aparecer no Google. Só ligar quando o conteúdo real
 * estiver publicado e revisado. Ver `spec.md` → Parte 14.
 */
export const permitirIndexacao = process.env.NEXT_PUBLIC_PERMITIR_INDEXACAO === "true"

export const marca = {
  nome: "Dra. Karollyne Morais",
  nomeCurto: "Karollyne Morais",
  // TODO: confirmar domínio definitivo
  dominio: enderecoBase(),
  // TODO: número real com DDI/DDD, só dígitos
  whatsapp: "",
  instagram: "",
  email: "",
  // TODO: dados da PJ para o rodapé
  razaoSocial: "",
  cnpj: "",
} as const

export const hero = {
  eyebrow: "Cursos online para médicos e residentes",
  titulo: "Aprofunde sua prática clínica sem sair do plantão.",
  subtitulo:
    "Aulas em vídeo com slides e materiais para baixar, acesso pelo celular e certificado de conclusão. Conteúdo autoral da Dra. Karollyne Morais.",
  ctaPrimario: { rotulo: "Ver os cursos", href: "/#cursos" },
  ctaSecundario: { rotulo: "Como funciona", href: "/#como-funciona" },
  /**
   * Slot da foto profissional dela. Enquanto for `null`, o hero mostra
   * a prévia da sala de aula — que é o produto em si.
   * TODO: `{ src: "/karollyne-hero.png", alt: "..." }` quando a foto chegar.
   */
  foto: null as { src: string; alt: string } | null,
}

/**
 * Números de prova social.
 * TODO: preencher com dados reais. Enquanto vazio, a seção não aparece.
 * Exemplo de formato: { valor: "1.200", label: "alunos formados" }
 */
export const numeros: { valor: string; label: string }[] = []

export const comoFunciona = [
  {
    passo: "01",
    titulo: "Escolha o curso",
    texto:
      "Veja a ementa completa antes de comprar — todos os módulos, todas as aulas, com a duração de cada uma. Sem caixa fechada.",
  },
  {
    passo: "02",
    titulo: "Estude no seu ritmo",
    texto:
      "Assista no celular entre um atendimento e outro. Fechou o navegador? Ao voltar, você retoma no mesmo segundo em que parou.",
  },
  {
    passo: "03",
    titulo: "Receba seu certificado",
    texto:
      "Ao concluir, o certificado é emitido automaticamente, com carga horária e um código que qualquer banca pode conferir online.",
  },
] as const

export const oQueRecebe = [
  {
    icone: "PlayCircle",
    titulo: "Aulas em vídeo",
    texto: "Gravadas em alta definição, organizadas em módulos e na ordem certa de estudo.",
  },
  {
    icone: "FileDown",
    titulo: "Slides e PDFs",
    texto: "O material de cada aula disponível para baixar e consultar quando precisar.",
  },
  {
    icone: "Smartphone",
    titulo: "Acesso no celular",
    texto: "A sala de aula funciona bem na tela pequena — porque é onde você vai estudar.",
  },
  {
    icone: "History",
    titulo: "Continue de onde parou",
    texto: "O progresso fica salvo por aula. Você nunca perde o fio do conteúdo.",
  },
  {
    icone: "Award",
    titulo: "Certificado com validação",
    texto: "PDF com carga horária e código público de conferência, para currículo e seleção.",
  },
  {
    icone: "RefreshCw",
    titulo: "Atualizações incluídas",
    texto: "Quando uma aula é revisada ou ampliada, você recebe sem pagar de novo.",
  },
] as const

/**
 * O catálogo NÃO fica aqui.
 * Os cursos vêm do banco (`src/lib/cursos.ts` → `listarCursosDoCatalogo`),
 * filtrados por status `PUBLICADO`. Publicar pelo painel é o que faz o curso
 * aparecer na landing — não editar este arquivo.
 */

export const sobre = {
  titulo: "Sobre a Dra. Karollyne Morais",
  // TODO: bio real, escrita por ela. O texto abaixo é estrutura, não conteúdo.
  paragrafos: [
    "[Parágrafo de apresentação: formação, onde se graduou, residência e área de atuação.]",
    "[Parágrafo de trajetória: experiência clínica, docência, congressos, publicações.]",
    "[Parágrafo de propósito: por que ela decidiu ensinar e para quem estes cursos existem.]",
  ],
  // TODO: identificação profissional — exigida na publicidade médica (CFM 2.336/2023)
  credenciais: {
    especialidade: "[Especialidade]",
    crm: "[CRM-UF 000000]",
    rqe: "[RQE 0000]",
  },
  foto: null as { src: string; alt: string } | null,
}

/**
 * Depoimentos de ALUNOS sobre o curso.
 * ⚠️ Nunca depoimento de paciente sobre tratamento — vedado pelo CFM.
 * TODO: coletar com autorização de uso de imagem e nome.
 */
export const depoimentos: {
  nome: string
  cargo: string
  texto: string
  foto?: string
}[] = []

export const pagamento = {
  titulo: "Compra segura, acesso na hora",
  texto:
    "O pagamento é processado pela Stripe — seus dados de cartão não passam pelo nosso site. Assim que o pagamento é aprovado, o acesso ao curso é liberado automaticamente.",
  selos: [
    "Pagamento processado pela Stripe",
    "Acesso liberado em segundos",
    "7 dias de garantia, previstos no Código de Defesa do Consumidor",
  ],
} as const

export const faq = [
  {
    pergunta: "Por quanto tempo eu tenho acesso ao curso?",
    // TODO: confirmar política de acesso (vitalício x prazo) antes de publicar
    resposta:
      "[Definir: acesso vitalício ou por prazo determinado.] Você acessa quantas vezes quiser, de qualquer dispositivo, com o mesmo login.",
  },
  {
    pergunta: "Consigo assistir pelo celular?",
    resposta:
      "Sim. A sala de aula foi desenhada primeiro para o celular, porque é onde a maior parte dos alunos estuda. Não é preciso instalar nenhum aplicativo — funciona pelo navegador.",
  },
  {
    pergunta: "Posso baixar os slides e PDFs?",
    resposta:
      "Pode. Cada aula traz seu material de apoio para download. Os arquivos são identificados com o seu e-mail, então evite compartilhá-los.",
  },
  {
    pergunta: "O certificado é válido?",
    resposta:
      "O certificado comprova a conclusão do curso, com carga horária e data, e traz um código que qualquer pessoa pode conferir aqui no site. É um certificado de curso livre — não substitui título de especialista nem registro em conselho.",
  },
  {
    pergunta: "E se eu não gostar do curso?",
    resposta:
      "Você tem 7 dias a partir da compra para desistir e receber o valor de volta, como prevê o Código de Defesa do Consumidor. Basta pedir pelo nosso canal de contato.",
  },
  {
    pergunta: "Como faço para tirar dúvidas sobre o conteúdo?",
    // TODO: confirmar canal de dúvidas antes de publicar
    resposta:
      "[Definir o canal: comentários nas aulas, e-mail ou WhatsApp.] As dúvidas são respondidas pela própria Dra. Karollyne.",
  },
] as const

export const ctaFinal = {
  titulo: "Pronto para começar?",
  texto:
    "Conheça os cursos disponíveis e comece a estudar hoje, no seu ritmo.",
  cta: { rotulo: "Ver os cursos", href: "/#cursos" },
}

// Âncoras absolutas de propósito: o cabeçalho aparece também nas páginas de
// curso e de autenticação, onde "#sobre" não existe e não levaria a lugar nenhum.
export const navegacao = [
  { rotulo: "Como funciona", href: "/#como-funciona" },
  { rotulo: "Cursos", href: "/#cursos" },
  { rotulo: "Sobre", href: "/#sobre" },
  { rotulo: "Dúvidas", href: "/#faq" },
] as const
