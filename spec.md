# Plataforma de Cursos — Dra. Karollyne Morais
## Especificação Inicial (v0.1 — descoberta)

> Documento mestre do projeto. Combina **Lean Inception** (descoberta), **Jobs to Be Done**
> (entender a demanda real) e **Spec-Driven Development** (execução com IA).
> É um documento **vivo**: evolui a cada release, não é entregável de gaveta.
>
> **Status:** rascunho para validação com a Dra. Karollyne
> **Data:** 2026-08-20
> **Autor técnico:** Álvaro | **Product Owner:** Dra. Karollyne Morais

---

## Sumário

- [Parte 0 — Decisões já travadas](#parte-0--decisões-já-travadas)
- [Parte 1 — Visão do produto](#parte-1--visão-do-produto)
- [Parte 2 — Atores e permissões](#parte-2--atores-e-permissões)
- [Parte 3 — Jobs to Be Done](#parte-3--jobs-to-be-done)
- [Parte 4 — Domínio e vocabulário](#parte-4--domínio-e-vocabulário)
- [Parte 5 — Requisitos funcionais](#parte-5--requisitos-funcionais)
- [Parte 6 — Requisitos não funcionais](#parte-6--requisitos-não-funcionais)
- [Parte 7 — Regras de negócio invioláveis](#parte-7--regras-de-negócio-invioláveis)
- [Parte 8 — Modelo de dados](#parte-8--modelo-de-dados)
- [Parte 9 — Arquitetura e integrações](#parte-9--arquitetura-e-integrações)
- [Parte 10 — Landing page](#parte-10--landing-page)
- [Parte 11 — Reaproveitamento do projeto base](#parte-11--reaproveitamento-do-projeto-base)
- [Parte 12 — Releases](#parte-12--releases)
- [Parte 13 — Custos](#parte-13--custos)
- [Parte 14 — Riscos e conformidade](#parte-14--riscos-e-conformidade)
- [Parte 15 — Decisões em aberto](#parte-15--decisões-em-aberto)
- [Apêndice A — Variáveis de ambiente](#apêndice-a--variáveis-de-ambiente)
- [Apêndice B — Checklist de setup (Release 0)](#apêndice-b--checklist-de-setup-release-0)

---

## Parte 0 — Decisões já travadas

Quatro decisões estruturais foram tomadas na abertura do projeto. Elas condicionam todo o
resto deste documento.

| # | Decisão | Escolha | Consequência |
|---|---------|---------|--------------|
| D1 | **Escopo** | Plataforma **exclusiva da Dra. Karollyne**. Ela é a única produtora e curadora. Professores convidados aparecem como autores do curso, mas **não têm login** — ela publica por eles. | Sem multi-tenant. Sem isolamento de dados por instrutor. Um único painel administrativo. Modelo de dados muito mais simples. |
| D2 | **Monetização** | **Venda direta com Stripe** — checkout no próprio site, compra por curso. | Reaproveitamos a integração Stripe que já existe no projeto base. Exige webhook idempotente e política de reembolso. |
| D3 | **Vídeo** | **Cloudflare Stream** — URLs assinadas, upload direto do navegador, player próprio. | Custo variável por minuto assistido. Requer token assinado por sessão. Sem limite de upload da Vercel. |
| D4 | **MVP** | Área de membros + player + PDF/slides · Landing estilo Cademí · Painel da Dra. · Certificado de conclusão. | Quatro frentes no primeiro release. Comentários, quizzes e comunidade ficam para a v1.1. |

### Como vamos trabalhar (o método)

```
Lean Inception  →  Jobs to Be Done  →  Spec-Driven Development
   (o quê)             (por quê)              (como)
      ↓                    ↓                     ↓
 este documento      Parte 3 deste doc     specs/NNN-feature/
```

Cada feature grande ganha uma pasta `specs/NNN-nome/` com `spec.md` (o quê e critérios de
aceite), `plan.md` (decisões técnicas) e `tasks.md` (tarefas atômicas). Decisões
arquiteturais relevantes viram ADRs em `docs/adr/`.

---

## Parte 1 — Visão do produto

### 1.1 Visão (template Geoffrey Moore)

> **Para** médicos, residentes e estudantes de medicina que precisam de formação prática e
> confiável na área de atuação da Dra. Karollyne,
> **que** hoje dependem de PDFs soltos no WhatsApp, gravações perdidas em drives e cursos
> genéricos de marketplace onde ninguém responde dúvidas,
> **a plataforma da Dra. Karollyne Morais é** uma área de membros com cursos em vídeo,
> slides e materiais de apoio,
> **que** entrega uma trilha organizada, acesso em qualquer dispositivo, acompanhamento de
> progresso e certificado ao final,
> **diferente de** Hotmart, Kiwify ou grupos de WhatsApp,
> **o nosso produto** é 100% da marca dela: sem concorrente na mesma tela, sem taxa de
> marketplace, com a base de alunos e os dados sob controle dela.

### 1.2 Produto É / Não É / Faz / Não Faz

| **É** | **Não é** |
|---|---|
| Uma área de membros com marca própria | Um marketplace de cursos de terceiros |
| Um canal direto entre a Dra. e os alunos dela | Uma rede social |
| Um repositório organizado de vídeo, slide e PDF | Um Google Drive com link compartilhado |
| Uma loja de cursos com checkout próprio | Uma assinatura tipo Netflix (por ora) |

| **Faz** | **Não faz** |
|---|---|
| Vende curso com cartão e gera matrícula automática | Não emite nota fiscal automaticamente (v2) |
| Hospeda vídeo com acesso protegido por matrícula | Não faz transmissão ao vivo no MVP |
| Emite certificado com código de validação pública | Não certifica carga horária junto a órgão de classe |
| Rastreia progresso por aula | Não corrige prova nem aplica quiz no MVP |
| Permite liberar acesso de cortesia manualmente | Não gerencia turmas presenciais nem chamada |

### 1.3 Personas

**P1 — Dra. Karollyne (Produtora / Administradora)**
Médica, produz o conteúdo, grava as aulas, monta os slides. Não é técnica.
- **Precisa:** subir uma aula nova em menos de 5 minutos, sem depender de ninguém.
- **Teme:** que o conteúdo dela vaze; que um aluno pague e não consiga assistir.
- **Sucesso para ela:** abrir o painel e ver quantos alunos estão estudando agora.

**P2 — Médico / Residente (aluno principal)**
25–45 anos, plantonista, tempo fragmentado, estuda pelo celular entre um atendimento e outro.
- **Precisa:** continuar de onde parou, baixar o PDF para ler offline, achar rápido a aula X.
- **Teme:** pagar caro e receber conteúdo raso; perder o acesso depois de um tempo.
- **Sucesso para ele:** aplicar na prática no plantão da mesma semana.

**P3 — Estudante de medicina (aluno secundário)**
20–26 anos, orçamento apertado, muito sensível a preço e a prova social.
- **Precisa:** assistir uma aula de amostra antes de comprar; parcelar.
- **Teme:** que seja conteúdo de internet reembalado.

**P4 — Professor convidado (não é usuário do sistema)**
Colega que grava um módulo. Aparece como autor, com nome, foto, titulação e CRM.
A Dra. sobe o material por ele. **Decisão D1:** não tem login.

**P5 — Álvaro (desenvolvedor / operador)**
Mantém, evolui e monitora. Precisa de logs, de webhook confiável e de um jeito simples de
liberar acesso na mão quando o pagamento der problema.

### 1.4 Jornadas

**Jornada da Dra. — publicar um curso novo**
```
Login → Painel → Novo curso → título, capa, descrição, preço, professor
  → Criar módulo 1 → Criar aula 1 → arrastar o .mp4 (upload direto p/ Cloudflare)
  → anexar slides (.pdf) → salvar
  → repetir aulas/módulos
  → Pré-visualizar como aluno → Publicar
  → Copiar link da página de vendas → divulgar no Instagram
```

**Jornada do aluno — da descoberta ao certificado**
```
Instagram/Google → Landing page → Página do curso → assiste aula gratuita de amostra
  → Comprar → cria conta (e-mail + senha ou Google) → Checkout Stripe → paga
  → Webhook cria matrícula → e-mail "acesso liberado"
  → Área do aluno → Sala de aula → assiste, marca concluída, baixa material
  → 100% concluído → Certificado em PDF → compartilha no LinkedIn
```

**Jornada de exceção — pagou e não recebeu acesso**
```
Aluno paga → webhook falha → aluno reclama no WhatsApp
  → Dra. abre Painel → Matrículas → Liberar acesso manual
  → aluno recebe e-mail → resolvido em 1 minuto, sem código
```

---

## Parte 2 — Atores e permissões

| Papel | Quem é | Pode |
|---|---|---|
| `ADMIN` | Dra. Karollyne | Tudo: cursos, aulas, materiais, alunos, matrículas, cupons, pedidos, configurações |
| `EQUIPE` | Secretária/editor (futuro) | Criar e editar conteúdo; **não** vê faturamento nem dados de pagamento |
| `ALUNO` | Quem comprou ou recebeu cortesia | Vê apenas os cursos em que tem matrícula **ATIVA** |
| *(visitante)* | Não autenticado | Landing, catálogo, página de curso, aulas gratuitas, validação de certificado |

**Regra de ouro:** o que separa aluno de visitante é a **matrícula**, não o login.
Estar logado não dá acesso a nada — a matrícula ativa dá.

---

## Parte 3 — Jobs to Be Done

### 3.1 Job statements

**Dra. Karollyne**
> Quando eu termino de gravar um módulo novo, quero publicá-lo sozinha em minutos, para que
> eu não dependa de terceiros e possa manter meu ritmo de produção.

> Quando um aluno me manda mensagem perguntando "onde está o material da aula 3?", quero que
> ele encontre sozinho, para que eu não vire suporte técnico do meu próprio curso.

**Médico / residente**
> Quando eu tenho 20 minutos livres no plantão, quero retomar exatamente de onde parei no
> celular, para que o tempo fragmentado ainda vire aprendizado.

> Quando eu termino um curso, quero um certificado com carga horária e validação, para que
> eu possa comprovar em processo seletivo e no currículo Lattes.

**Estudante**
> Quando eu estou decidindo se compro, quero assistir uma aula real antes, para que eu não
> sinta que estou comprando no escuro.

### 3.2 Forças do progresso (Bob Moesta)

| Força | O que é, neste caso |
|---|---|
| **Empurra** (dor atual) | Material espalhado em drives e WhatsApp; conteúdo bom mas desorganizado; ela perde vendas por não ter onde vender |
| **Puxa** (atração) | Marca própria, alunos próprios, receita direta, autoridade consolidada |
| **Ansiedade** | "E se o vídeo vazar?" "E se o aluno pagar e não conseguir entrar?" "E se der problema e eu não souber resolver?" |
| **Hábito** | O jeito atual (mandar link do drive) funciona *mais ou menos* e não custa nada |

**Implicação de produto:** as duas ansiedades principais — vazamento de conteúdo e falha no
acesso — viram **requisitos de primeira classe**, não "melhorias futuras". Ver Parte 7.

---

## Parte 4 — Domínio e vocabulário

### 4.1 Glossário

| Termo | Significado |
|---|---|
| **Curso** | Produto vendável. Tem preço, capa, descrição, autor e uma trilha de módulos |
| **Módulo** | Agrupamento ordenado de aulas dentro de um curso |
| **Aula** | Unidade de consumo. Tem um vídeo (ou texto/PDF) e materiais anexos |
| **Material** | Arquivo de apoio: slide, PDF, planilha, link. Vive na aula ou no curso |
| **Matrícula** | Vínculo entre um aluno e um curso. **É o que dá acesso.** |
| **Progresso** | Registro de quanto o aluno assistiu de cada aula |
| **Certificado** | PDF emitido ao concluir o curso, com código de validação pública |
| **Professor** | Autor exibido do curso. Metadado, **não** é usuário do sistema |
| **Pedido** | Registro de uma tentativa de compra e seu status no Stripe |
| **Cortesia** | Matrícula criada manualmente pela Dra., sem pagamento |
| **Aula gratuita** | Aula marcada como amostra, acessível sem matrícula |

### 4.2 Hierarquia

```
Curso
 └── Módulo (ordem)
      └── Aula (ordem)
           └── Material[]        ← slides, PDFs, planilhas
Curso
 └── Material[]                  ← materiais gerais (ementa, bibliografia)
```

### 4.3 Estados

**Curso**
```
RASCUNHO ──publicar──> PUBLICADO ──arquivar──> ARQUIVADO
              ↑                                     │
              └──────────── republicar ─────────────┘
```
Curso `RASCUNHO` não aparece no catálogo e não pode ser comprado.
Curso `ARQUIVADO` some do catálogo, mas **quem já tem matrícula continua acessando**.

**Matrícula**
```
                  ┌──expira (prazo)──> EXPIRADA
ATIVA ────────────┼──reembolso───────> REEMBOLSADA
                  └──cancelamento────> CANCELADA
```
Uma vez `REEMBOLSADA` ou `CANCELADA`, o acesso é revogado imediatamente.
Progresso e certificado emitido **são preservados** — histórico não se apaga.

**Pedido**
```
PENDENTE ──pagamento aprovado──> PAGO ──reembolso──> REEMBOLSADO
    └──falha/expirou──> FALHOU
```

---

## Parte 5 — Requisitos funcionais

Cada épico traz os requisitos e os **critérios de aceite** que vamos usar para dizer
"está pronto". `[MVP]` entra no primeiro release; `[v1.1]` fica para depois.

### E1 — Contas e autenticação `[MVP]`

- RF1.1 Cadastro de aluno com nome, e-mail e senha, com verificação de e-mail por código
- RF1.2 Login social com Google (reduz atrito no checkout)
- RF1.3 Recuperação de senha por e-mail
- RF1.4 Perfil do aluno: nome, foto, telefone e **CPF** (necessário para o certificado)
- RF1.5 Papéis `ADMIN` / `ALUNO`; o primeiro usuário, criado por seed, é a Dra.
- RF1.6 `[v1.1]` Limite de sessões simultâneas por conta (antipirataria)

**Critérios de aceite**
- Um aluno cria conta, verifica e-mail e loga em menos de 2 minutos
- Um aluno sem matrícula que acessa `/aluno/curso/x` é redirecionado — nunca vê conteúdo
- Um `ALUNO` que acessa qualquer rota `/admin/*` recebe 404 ou redirect, nunca a tela

### E2 — Catálogo e página de vendas do curso `[MVP]`

- RF2.1 Catálogo público em `/cursos` com busca e filtro por categoria e nível
- RF2.2 Página do curso em `/cursos/[slug]`: capa, trailer, descrição, o que vai aprender,
  ementa completa (módulos e aulas com duração), professor, depoimentos, FAQ, preço, CTA
- RF2.3 Aula de amostra reproduzível sem login
- RF2.4 SEO: metadados Open Graph, título e descrição por curso, sitemap
- RF2.5 Contador de matriculados (prova social), habilitável por curso

**Critérios de aceite**
- A ementa mostra todas as aulas mesmo para quem não comprou, com cadeado nas bloqueadas
- Compartilhar o link no WhatsApp gera preview com capa e título corretos

### E3 — Checkout e matrícula `[MVP]`

- RF3.1 Botão comprar → login/cadastro (se preciso) → Stripe Checkout Session
- RF3.2 Webhook `checkout.session.completed` cria `Pedido` PAGO + `Matricula` ATIVA de forma
  **idempotente** — reprocessar o mesmo evento não duplica matrícula
- RF3.3 E-mail transacional de acesso liberado, com link direto para a sala de aula
- RF3.4 Página de sucesso pós-pagamento levando direto ao curso
- RF3.5 Webhook `charge.refunded` → matrícula `REEMBOLSADA`, acesso revogado
- RF3.6 Liberação manual de matrícula pelo painel (cortesia, venda no WhatsApp, correção)
- RF3.7 `[v1.1]` Cupons de desconto (percentual e valor fixo, com limite de uso e validade)
- RF3.8 `[v1.1]` PIX e parcelamento — **depende de confirmação da conta Stripe BR** (Parte 15)

**Critérios de aceite**
- Pagar com cartão de teste libera o acesso em menos de 10 segundos
- Reenviar o mesmo evento de webhook não cria uma segunda matrícula
- Um reembolso feito no painel do Stripe tira o acesso do aluno sem intervenção manual

### E4 — Sala de aula (área de membros) `[MVP]`

- RF4.1 `/aluno` lista os cursos com matrícula ativa e o percentual concluído
- RF4.2 Sala de aula com sidebar de módulos/aulas + player central + abas de material
- RF4.3 Player Cloudflare Stream com URL assinada, expiração curta e retomada de posição
- RF4.4 Marcar aula como concluída — automático ao atingir 90% do vídeo, e manual
- RF4.5 Botão "próxima aula" e navegação por teclado
- RF4.6 Download/visualização de materiais via rota autenticada com URL temporária
- RF4.7 Barra de progresso do curso e destaque de "continuar de onde parou"
- RF4.8 Marca d'água dinâmica sobre o vídeo com nome e e-mail do aluno
- RF4.9 Responsivo de verdade: a sala de aula precisa funcionar bem no celular
- RF4.10 `[v1.1]` Comentários e dúvidas por aula, com resposta da Dra.
- RF4.11 `[v1.1]` Anotações pessoais com marcação de tempo do vídeo

**Critérios de aceite**
- Copiar a URL do vídeo e abrir em aba anônima **não** reproduz
- Fechar o navegador no meio da aula e voltar depois retoma no mesmo segundo
- Um PDF baixado tem o e-mail do aluno carimbado no rodapé

### E5 — Painel da Dra. (produção de conteúdo) `[MVP]`

- RF5.1 CRUD de curso: dados, capa, preço, tipo de acesso, professor, categoria, status
- RF5.2 CRUD de módulo e aula com reordenação por arrastar
- RF5.3 Upload de vídeo direto do navegador para o Cloudflare Stream, com barra de progresso
- RF5.4 Upload de materiais (PDF, slide, planilha) para armazenamento privado
- RF5.5 Pré-visualização "ver como aluno" antes de publicar
- RF5.6 Publicar / despublicar curso e aula individualmente
- RF5.7 CRUD de professores convidados (nome, foto, titulação, CRM/RQE, bio)
- RF5.8 CRUD de depoimentos de alunos, com aprovação
- RF5.9 Configurações da plataforma: logo, cores, textos da landing, contato, redes

**Critérios de aceite**
- A Dra. publica uma aula nova com vídeo e slide sem abrir nada além do painel
- Um vídeo de 1 GB sobe sem estourar limite de servidor
- Nenhuma ação de conteúdo exige linha de comando ou ajuda do desenvolvedor

### E6 — Gestão de alunos `[MVP]`

- RF6.1 Lista de alunos com busca por nome, e-mail e CPF
- RF6.2 Ficha do aluno: cursos, progresso, pedidos, certificados, último acesso
- RF6.3 Conceder ou revogar matrícula manualmente
- RF6.4 Reenviar e-mail de acesso
- RF6.5 Exportar lista de alunos em CSV

### E7 — Certificado `[MVP]`

- RF7.1 Emissão automática ao atingir o percentual mínimo de conclusão (padrão 100%)
- RF7.2 PDF com nome do aluno, CPF, curso, carga horária, data e código de validação
- RF7.3 Página pública `/certificados/[codigo]` para conferência por terceiros
- RF7.4 Dados do certificado congelados na emissão (snapshot) — mudar o curso depois não
  altera certificados já emitidos
- RF7.5 Reemissão pelo aluno a qualquer momento, mantendo o mesmo código

**Critérios de aceite**
- Quem recebe o certificado valida o código sem ter conta na plataforma
- Renomear o curso não muda o nome impresso em certificados antigos

### E8 — Landing page `[MVP]`

Detalhada na Parte 10.

### E9 — E-mails transacionais `[MVP]`

Verificação de e-mail · Recuperação de senha · Acesso liberado (pós-compra) ·
Certificado disponível · `[v1.1]` Aviso de curso novo · `[v1.1]` Lembrete de curso parado

### E10 — Painel de resultados `[MVP básico]`

- RF10.1 Cards: alunos ativos, matrículas no mês, faturamento no mês, taxa de conclusão
- RF10.2 Gráfico de vendas por período (`recharts` já está no projeto)
- RF10.3 `[v1.1]` Retenção por aula — onde os alunos param de assistir

---

## Parte 6 — Requisitos não funcionais

| # | Requisito | Alvo |
|---|---|---|
| RNF1 | **Mobile-first** | A sala de aula é usada majoritariamente no celular. Nenhuma tela pode quebrar abaixo de 375px |
| RNF2 | **Performance** | LCP < 2,5s na landing e na página do curso. Player inicia em < 3s |
| RNF3 | **Proteção do conteúdo** | Nenhum vídeo ou material acessível por URL direta sem verificação de matrícula |
| RNF4 | **Disponibilidade** | Vercel + Cloudflare. Falha do banco não pode derrubar a landing (estático/ISR) |
| RNF5 | **LGPD** | Política de privacidade, base legal declarada, exclusão de conta sob pedido, retenção definida |
| RNF6 | **Acessibilidade** | Contraste AA, navegação por teclado na sala de aula, legendas nos vídeos (meta v1.1) |
| RNF7 | **SEO** | Landing e páginas de curso indexáveis, com dados estruturados `Course` do schema.org |
| RNF8 | **Observabilidade** | Log de eventos de negócio (matrícula, pagamento, certificado) + alerta de webhook falho |
| RNF9 | **Backup** | Backup diário do banco com retenção de 30 dias |
| RNF10 | **Custo previsível** | Alerta quando o consumo de minutos entregues do Stream passar do orçado |

---

## Parte 7 — Regras de negócio invioláveis

Estas regras vão para `context/rules.md` e valem para qualquer código escrito no projeto.

1. **A matrícula ativa é o único portão de acesso.** Nenhuma rota de conteúdo confia em
   sessão, cookie ou parâmetro de URL — sempre consulta a matrícula no servidor.
2. **Vídeo nunca é servido por URL pública.** Sempre token assinado, com expiração de no
   máximo 2 horas, gerado no servidor depois de validar a matrícula.
3. **Material nunca é servido por URL pública.** O download passa por rota autenticada que
   emite URL temporária de 60 segundos.
4. **Webhook de pagamento é idempotente.** O identificador da sessão Stripe é único no banco;
   reprocessar o mesmo evento nunca duplica pedido ou matrícula.
5. **Certificado emitido é imutável.** Nome, curso, carga horária e data são congelados na
   emissão — nunca recalculados a partir dos dados atuais.
6. **Progresso e certificado nunca são apagados** por cancelamento, reembolso ou expiração.
   Só o acesso é revogado.
7. **Curso arquivado não tira acesso de quem já comprou.**
8. **Nenhum dado de cartão passa pela nossa aplicação.** Tudo via Stripe Checkout hospedado.
9. **Toda mutação relevante gera `LogEvento`** (matrícula, pagamento, publicação, emissão).
10. **Toda entrada de usuário é validada com Zod** na Server Action ou API Route, sem exceção.

---

## Parte 8 — Modelo de dados

Proposta de schema Prisma. MySQL com `relationMode = "prisma"` (sem foreign keys no banco),
portanto **todo relacionamento precisa de `@@index` explícito**.

### 8.1 Autenticação (reaproveitado do projeto base)

`User` · `Account` · `Session` · `VerificationToken` · `AuthToken` · `LoginAttempt`

O `User` muda: sai `lojaId`, entra `cpf`, `telefone`, e o enum `Role` passa a ser
`ADMIN | EQUIPE | ALUNO` com padrão `ALUNO`.

### 8.2 Conteúdo

```prisma
enum StatusCurso     { RASCUNHO PUBLICADO ARQUIVADO }
enum NivelCurso      { INTRODUTORIO INTERMEDIARIO AVANCADO }
enum TipoAcesso      { VITALICIO PRAZO_DIAS }
enum TipoAula        { VIDEO TEXTO PDF }
enum TipoMaterial    { PDF SLIDE PLANILHA LINK IMAGEM }

model Professor {          // autor exibido — NÃO é usuário do sistema
  id, nome, slug, titulacao, crm, especialidade, bio, fotoUrl, instagram
  cursos Curso[]
}

model Categoria { id, nome, slug, ordem, cursos Curso[] }

model Curso {
  id, slug @unique, titulo, subtitulo, descricao @db.Text
  capaUrl, trailerVideoUid
  professorId, categoriaId
  nivel NivelCurso, cargaHorariaMinutos Int
  precoCentavos Int, precoDeCentavos Int?     // "de/por"
  stripePriceId String?
  tipoAcesso TipoAcesso, acessoDias Int?
  status StatusCurso @default(RASCUNHO), publicadoEm DateTime?
  emiteCertificado Boolean @default(true)
  percentualParaCertificado Int @default(100)
  destaque Boolean, ordem Int
  modulos, materiais, matriculas, depoimentos, faqs
}

model Modulo {
  id, cursoId, titulo, descricao, ordem
  liberacaoDias Int?     // drip content — v1.1
  aulas Aula[]
}

model Aula {
  id, moduloId, slug, titulo, descricao @db.Text
  tipo TipoAula @default(VIDEO)
  videoUid String?              // UID do Cloudflare Stream
  duracaoSegundos Int?
  ordem Int
  gratuita Boolean @default(false)   // aula de amostra
  publicada Boolean @default(false)
  materiais Material[], progressos ProgressoAula[]
}

model Material {
  id, aulaId String?, cursoId String?   // um dos dois
  titulo, tipo TipoMaterial
  arquivoKey String       // chave no bucket privado (R2)
  tamanhoBytes Int, downloadPermitido Boolean @default(true), ordem Int
}
```

### 8.3 Acesso e progresso

```prisma
enum OrigemMatricula { COMPRA CORTESIA IMPORTACAO }
enum StatusMatricula { ATIVA EXPIRADA CANCELADA REEMBOLSADA }

model Matricula {
  id, userId, cursoId, pedidoId String?
  origem OrigemMatricula, status StatusMatricula @default(ATIVA)
  iniciadaEm, expiraEm DateTime?, concluidaEm DateTime?
  percentualConcluido Int @default(0)
  @@unique([userId, cursoId])
}

model ProgressoAula {
  id, userId, aulaId, matriculaId
  segundosAssistidos Int, ultimaPosicao Int
  concluida Boolean @default(false), concluidaEm DateTime?
  @@unique([userId, aulaId])
}

model Certificado {
  id, codigo @unique               // ex.: KM-2026-A7F3C9
  userId, cursoId, matriculaId @unique
  nomeAluno, cpfAluno, cursoTitulo, cargaHorariaMinutos   // snapshot imutável
  emitidoEm DateTime
}
```

### 8.4 Comércio

```prisma
enum StatusPedido { PENDENTE PAGO FALHOU REEMBOLSADO }
enum TipoCupom    { PERCENTUAL VALOR_FIXO }

model Pedido {
  id, userId, cursoId
  stripeSessionId @unique, stripePaymentIntentId String?
  valorCentavos Int, cupomId String?
  status StatusPedido @default(PENDENTE)
  criadoEm, pagoEm DateTime?
}

model Cupom {          // v1.1
  id, codigo @unique, tipo TipoCupom, valor Int
  cursoId String?, usosMaximos Int?, usosAtuais Int @default(0)
  validoAte DateTime?, ativo Boolean @default(true)
}
```

### 8.5 Conteúdo de marketing e operação

```prisma
model Depoimento     { id, cursoId?, nome, cargo, fotoUrl, texto, nota Int?, aprovado, ordem }
model Faq            { id, cursoId?, pergunta, resposta @db.Text, ordem }
model ConfigPlataforma { id, nomeMarca, logoUrl, corPrimaria, whatsapp, instagram, textosLanding Json }
model LogEvento      { id, userId?, tipo, entidade, entidadeId, metadata Json, ip, criadoEm }
```

---

## Parte 9 — Arquitetura e integrações

### 9.1 Stack

| Camada | Tecnologia | Situação |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | ✅ já no projeto |
| Estilo | Tailwind 4 + shadcn/ui (23 componentes) + dark mode | ✅ já no projeto |
| Banco | MySQL + Prisma 5 (`relationMode = "prisma"`) | ✅ já no projeto |
| Auth | NextAuth v5 (Credentials + Google + GitHub) | ✅ já no projeto |
| Pagamento | Stripe Checkout + Webhook | ✅ já no projeto (adaptar) |
| **Vídeo** | **Cloudflare Stream** | 🆕 a integrar |
| **Materiais** | **Cloudflare R2** (bucket privado, S3-compatible) | 🆕 a integrar |
| Imagens públicas | Cloudinary (capas, avatares) | ✅ já no projeto |
| E-mail | Resend + React Email | ✅ já no projeto |
| Rate limit | Upstash Redis | ✅ já no projeto |
| PDF (certificado) | jsPDF | ✅ já no projeto |
| Gráficos | Recharts | ✅ já no projeto |
| Testes | Vitest | ✅ já no projeto |
| Deploy | Vercel | ✅ já no projeto |

### 9.2 Mapa de rotas

**Públicas**
| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/cursos` | Catálogo |
| `/cursos/[slug]` | Página de vendas do curso |
| `/professores/[slug]` | Perfil do professor convidado |
| `/certificados/[codigo]` | Validação pública de certificado |
| `/login` `/cadastro` `/recuperar-senha` `/verificar-email` | Autenticação |
| `/termos-de-uso` `/politica-de-privacidade` | Legal |

**Área do aluno**
| Rota | Descrição |
|---|---|
| `/aluno` | Meus cursos, progresso, continuar de onde parou |
| `/aluno/curso/[slug]` | Sala de aula (redireciona para a próxima aula) |
| `/aluno/curso/[slug]/[aulaSlug]` | Player + materiais |
| `/aluno/certificados` | Certificados emitidos |
| `/aluno/perfil` | Dados pessoais, CPF, senha |

**Painel administrativo**
| Rota | Descrição |
|---|---|
| `/admin` | Dashboard de resultados |
| `/admin/cursos` · `/admin/cursos/[id]` | Lista e editor de curso (módulos e aulas) |
| `/admin/cursos/[id]/aulas/[aulaId]` | Editor de aula: vídeo + materiais |
| `/admin/alunos` · `/admin/alunos/[id]` | Gestão de alunos |
| `/admin/matriculas` | Conceder / revogar acesso |
| `/admin/pedidos` | Vendas e status de pagamento |
| `/admin/professores` · `/admin/depoimentos` · `/admin/cupons` | Conteúdo de apoio |
| `/admin/configuracoes` | Marca, textos da landing, contato |

**API**
| Rota | Método | Auth | Descrição |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth |
| `/api/checkout` | POST | Sessão | Cria Stripe Checkout Session |
| `/api/webhook/stripe` | POST | Assinatura Stripe | Cria matrícula, processa reembolso |
| `/api/webhook/stream` | POST | Assinatura Cloudflare | Atualiza duração e status do vídeo |
| `/api/video/[aulaId]/token` | GET | Sessão + matrícula | Devolve token assinado do player |
| `/api/materiais/[id]/download` | GET | Sessão + matrícula | Redirect para URL temporária do R2 |
| `/api/upload/video` | POST | ADMIN | Cria URL de upload direto no Stream |
| `/api/upload/imagem` | POST | ADMIN | Upload Cloudinary (reaproveitado) |
| `/api/cron/expirar-matriculas` | GET | `CRON_SECRET` | Expira matrículas com prazo vencido |

### 9.3 Fluxo de vídeo — upload

```
Dra. seleciona o .mp4
   ↓
Server Action valida ADMIN → chama Cloudflare API "direct_upload"
   (requireSignedURLs: true, maxDurationSeconds, creator: cursoId)
   ↓
Devolve { uploadURL, uid }  →  browser envia o arquivo DIRETO para o Cloudflare
   (não passa pelo nosso servidor → sem limite de 4,5 MB da Vercel)
   ↓
Salva aula.videoUid = uid
   ↓
Webhook do Stream avisa "ready" → grava duracaoSegundos e libera a aula
```

### 9.4 Fluxo de vídeo — reprodução

```
Aluno abre /aluno/curso/[slug]/[aulaSlug]
   ↓
Server Component consulta Matricula (userId + cursoId, status ATIVA, não expirada)
   ↓  não tem → redirect para a página de vendas
   ↓  tem
GET /api/video/[aulaId]/token → assina JWT com a chave do Stream (exp ≈ 2h)
   ↓
Player carrega com o token. Overlay HTML com nome + e-mail do aluno,
reposicionado a cada 30s (marca d'água dinâmica)
   ↓
A cada 15s o player envia posição → Server Action salva ProgressoAula
   ↓
Ao passar de 90% → aula concluída → recalcula percentual da matrícula
   ↓
100% → emite Certificado
```

### 9.5 Fluxo de materiais (PDF / slides)

```
Upload:   Admin → Server Action → PUT direto no R2 (bucket privado) → salva arquivoKey
Download: Aluno clica → GET /api/materiais/[id]/download
          → valida matrícula → gera presigned URL (60s) → 302 redirect
          → (opcional) carimba e-mail do aluno no rodapé do PDF com pdf-lib
```

### 9.6 Fluxo de compra

```
/cursos/[slug] → "Quero me inscrever"
   ↓ não logado → /cadastro?redirect=/cursos/[slug]
POST /api/checkout { cursoId }
   → cria Pedido PENDENTE
   → Stripe Checkout Session (mode: payment, client_reference_id: userId,
     metadata: { cursoId, pedidoId })
   ↓
Stripe hospeda o pagamento → redireciona para /obrigado?session_id=...
   ↓
Webhook checkout.session.completed
   → Pedido PAGO (idempotente por stripeSessionId)
   → Matricula ATIVA
   → e-mail "acesso liberado"
```

---

## Parte 10 — Landing page

Referência escolhida: **lp.cademi.com.br**. O que funciona lá é a estrutura de conversão —
hero direto, prova social pesada, três passos, features em lista, CTA repetido. O que vamos
mudar é o conteúdo: a Cademí vende software para produtores; nós vendemos **formação médica
com a assinatura de uma pessoa**. A autoridade dela é o principal ativo da página.

### 10.1 Mapa de seções

| # | Seção Cademí | Nossa versão |
|---|---|---|
| 1 | Hero "Entregue e venda mais" + mockup de notebook | **Hero de autoridade**: foto dela + headline sobre o resultado do aluno + CTA "Conheça os cursos" + CTA secundário "Assistir aula gratuita" |
| 2 | Logos de empresas + depoimentos | **Números e credenciais**: alunos formados, horas de conteúdo, instituições/congressos onde atuou |
| 3 | Squeeze Method (3 passos) | **Como funciona**: 1) Escolha o curso · 2) Estude no seu ritmo, no celular · 3) Receba seu certificado |
| 4 | Lista de features por passo | **O que você recebe**: aulas em vídeo HD, slides e PDFs para baixar, acesso vitalício, certificado com validação, atualizações incluídas |
| 5 | — | **Catálogo em destaque**: cards dos cursos publicados com preço e CTA |
| 6 | Suporte #GenteDeVerdade | **Canal de dúvidas**: como o aluno fala com a Dra. (comentários na aula / WhatsApp) |
| 7 | "Mate sua curiosidade" | **Aula gratuita de amostra** reproduzível ali mesmo |
| 8 | Logos de gateways | **Formas de pagamento** + selo de compra segura + garantia de 7 dias |
| 9 | Migração | **Sobre a Dra. Karollyne**: formação, especialidade, CRM/RQE, trajetória, foto profissional |
| 10 | Depoimentos | **Depoimentos de alunos** (médicos e residentes), com foto e função |
| 11 | CTA final | **FAQ** + CTA final de inscrição |
| 12 | Rodapé | Rodapé: links legais, contato, CNPJ, redes sociais |

### 10.2 Direção visual

Manter o que a referência acerta: fundo claro, muito respiro, tipografia sans moderna,
seções de largura contida, imagens grandes e limpas.

Ajustar para o contexto médico: paleta sóbria (um neutro claro + uma cor de acento definida
com ela), zero sensacionalismo, nada de contagem regressiva agressiva ou "última chance".
Credibilidade vale mais que urgência aqui — e ainda tem a questão da publicidade médica
(Parte 14).

**Pendente:** logo, paleta e fotos profissionais. Sem isso a landing sai com placeholder.

---

## Parte 11 — Reaproveitamento do projeto base

O projeto base é o **Courtesyfy** (SaaS de chaves promocionais). A infraestrutura é
excelente e economiza semanas; o domínio de negócio inteiro precisa sair.

### 11.1 Mantém (aproveitamento direto)

| Item | Onde |
|---|---|
| NextAuth v5 completo — Credentials + Google + GitHub, verificação de e-mail, tokens, tentativas de login | `src/lib/auth.ts`, `src/app/api/auth`, `login`, `register`, `verify-email`, `forgot-password` |
| Prisma singleton e models de autenticação | `src/lib/prisma.ts`, `prisma/schema.prisma` |
| Stripe: client, criação de checkout, padrão de webhook com verificação de assinatura | `src/lib/stripe.ts`, `src/app/api/webhook` |
| Resend + React Email (templates prontos) | `src/lib/email.ts`, `src/emails`, `src/components/emails` |
| Rate limit com Upstash | `src/lib/rate-limit.ts`, `src/lib/upstash.ts` |
| Design system: 23 componentes shadcn/ui, tokens OKLCH, dark mode | `src/components/ui`, `src/app/globals.css` |
| Headers de segurança (CSP, X-Frame-Options, etc.) | `next.config.ts` — ajustar CSP para Cloudflare |
| Upload de imagem no Cloudinary | `src/app/api/upload/route.ts` — trocar a pasta |
| jsPDF (vai virar o gerador de certificado) | dependência já instalada |
| Recharts (dashboard de vendas) | dependência já instalada |
| Vitest configurado | `vitest.config.ts`, `tests/` |
| Versionamento automático | `scripts/update-version.js` |
| Estrutura `(panel)` / `(public)` com `_actions` e `_components` | `src/app` |

### 11.2 Adapta

| Item | Mudança |
|---|---|
| `middleware.ts` | Domínio canônico e nova lista de rotas públicas |
| `src/lib/auth.ts` | `lojaId` sai da sessão; entram os papéis novos |
| `src/lib/email.ts` | `EMAIL_FROM`, remetente e templates do novo contexto |
| `next.config.ts` | CSP liberando `cloudflarestream.com` e o bucket R2 |
| `.claude/commands/iniciar-contexto.md` | Aponta para os arquivos do projeto novo |

### 11.3 Remove

**Modelos Prisma:** `Loja`, `Layout`, `Campanha`, `LoteChave`, `Chave`, `Cliente`,
`Resgate`, `SolicitacaoImpressao` e os enums associados.

**Rotas:** `/dashboard/campanhas`, `/chaves`, `/resgates`, `/validar`, `/totem`,
`/impressao`, `/layout`, `/lojas`, `/clientes`, `/c/[codigo]`, `/r/[lojaId]`, `/resgatar`,
`/print`, `/onboarding/loja`, `/api/chaves`, `/api/lotes`, `/api/print`,
`/api/checkout-produto`, `/api/cron/expirar-chaves`.

**Dependências:** `qrcode`, `qrcode.react`, `jsqr`, `html2canvas` e (a confirmar) `twilio`.
`canvas-confetti` fica — vira a comemoração de conclusão de curso.

**Arquivos de contexto:** já removidos nesta sessão — `TODO.md`,
`planning/context_principal.md`, `planning/ia-contexto-funcionalidades.md`,
`planning/ia-contexto-instalacao.md`. O `spec.md` antigo (projeto "Achei no Jardim Botânico")
foi substituído por este documento; o método de trabalho dele foi preservado.

---

## Parte 12 — Releases

Sequenciamento pensado para entregar valor cedo e deixar a Dra. produzindo conteúdo o quanto
antes — a plataforma sem conteúdo não vale nada.

### R0 — Fundação (limpeza) · ~1 semana
Remover o domínio Courtesyfy do código e do schema · novo `schema.prisma` · seed com a conta
ADMIN dela · variáveis de ambiente · marca e paleta · deploy inicial no domínio definitivo.
**Entrega:** projeto limpo, buildando, autenticando e publicado.

### R1 — Núcleo do conteúdo · ~2 semanas
Painel de cursos, módulos e aulas · upload de vídeo para o Cloudflare Stream · upload de
materiais no R2 · sala de aula com player, progresso e materiais · controle de acesso por
matrícula (liberada manualmente por enquanto).
**Entrega:** a Dra. já consegue subir um curso inteiro e um aluno de teste consegue assistir.
**É o marco mais importante do projeto.**

### R2 — Venda · ~1,5 semana
Catálogo · página de vendas do curso · checkout Stripe · webhook idempotente · matrícula
automática · e-mails transacionais · painel de pedidos.
**Entrega:** dá para vender.

### R3 — Landing e certificado · ~1,5 semana
Landing page completa · página de validação de certificado · geração do PDF · depoimentos ·
FAQ · SEO e Open Graph.
**Entrega:** dá para divulgar.

### R4 — Lançamento · ~1 semana
Políticas legais · analytics · testes de ponta a ponta do fluxo de compra · carga do conteúdo
real · revisão de segurança · monitoramento de custo do Stream.
**Entrega:** v1.0 no ar.

### v1.1 e além
Comentários e dúvidas por aula · quizzes e provas · cupons · drip content · anotações do
aluno · retenção por aula · assinatura recorrente (acesso a todos os cursos) · PWA/offline ·
notificação por WhatsApp · emissão de nota fiscal.

---

## Parte 13 — Custos

Estimativa mensal em regime de operação. O único item que escala com o sucesso é o vídeo.

| Item | Custo | Observação |
|---|---|---|
| Vercel Pro | ~US$ 20 | Recomendado em produção (domínio, analytics, limites) |
| MySQL | a confirmar | Já contratado no projeto base — verificar provedor e plano |
| **Cloudflare Stream — armazenamento** | US$ 5 por 1.000 min | 20h de curso ≈ 1.200 min ≈ **US$ 6/mês** |
| **Cloudflare Stream — entrega** | US$ 1 por 1.000 min | **Este é o custo variável.** 100 alunos × 20h ≈ 120.000 min ≈ **US$ 120** |
| Cloudflare R2 | US$ 0,015/GB | Sem taxa de saída. 5 GB de PDFs ≈ US$ 0,08 |
| Resend | US$ 0 → 20 | Grátis até 3.000 e-mails/mês |
| Cloudinary | US$ 0 | Free tier atende as imagens |
| Upstash Redis | US$ 0 | Free tier atende |
| Stripe | ~4% + taxa fixa por venda | Sem mensalidade |
| Domínio | ~R$ 40/ano | — |

**Leitura importante:** o custo de entrega de vídeo é de aproximadamente **US$ 1,20 por aluno
que assiste 20 horas**. Num curso de R$ 497, isso é menos de 1,5% da receita. O modelo se
paga com folga — mas precisa de alerta de consumo para não haver surpresa (RNF10).

---

## Parte 14 — Riscos e conformidade

Esta parte existe porque o produto é de uma **médica**, e isso traz obrigações que um curso
de marketing não tem. Vale conversar com o jurídico dela antes do lançamento.

| # | Risco | Mitigação |
|---|---|---|
| R1 | **Publicidade médica (CFM)** — a Resolução CFM nº 2.336/2023 regula como um médico pode se anunciar: sem promessa de resultado, sem sensacionalismo, com identificação de nome, CRM e RQE | A landing evita linguagem de promessa e urgência artificial; nome, CRM e especialidade aparecem de forma clara. **Recomendo validar os textos com o jurídico/CRM antes de publicar** |
| R2 | **Depoimentos** — o CFM veda depoimento de *paciente*. Depoimento de *aluno* sobre um curso é outra relação, mas a fronteira merece checagem | Depoimentos apenas de alunos, sobre o conteúdo do curso, nunca sobre tratamento recebido |
| R3 | **Imagens clínicas nos slides** — foto de paciente é dado sensível de saúde (LGPD art. 11) | Anonimização obrigatória + termo de consentimento arquivado. Vale um checklist no painel na hora de subir material |
| R4 | **Direito autoral de terceiros** — imagens de atlas e livros nos slides | Material autoral ou banco licenciado. Registrar a origem de cada imagem |
| R5 | **Pirataria** — vazamento de vídeo e PDF | URLs assinadas, marca d'água dinâmica com dados do aluno, carimbo nos PDFs, limite de sessões simultâneas (v1.1) |
| R6 | **Direito de arrependimento (CDC art. 49)** — 7 dias para compra online | Política de reembolso explícita no checkout + fluxo de revogação de acesso já previsto |
| R7 | **Nota fiscal** — cada venda exige NFS-e | Precisa de CNPJ (PJ médica). No MVP, emissão manual; automatizar na v2 |
| R8 | **Conteúdo de professor convidado** | Contrato de cessão de direitos de uso da aula, assinado antes de publicar |
| R9 | **LGPD geral** | Política de privacidade, base legal (execução de contrato), canal de contato, exclusão de conta sob pedido, retenção definida |
| R10 | **Dependência de fornecedor de vídeo** | O `videoUid` fica no nosso banco e os arquivos originais ficam com ela. Migrar de plataforma é trabalhoso, mas não é perda de conteúdo |

---

## Parte 15 — Decisões em aberto

Precisam de resposta da Dra. Karollyne (ou de verificação técnica) antes ou durante o R0.

**Marca e identidade**
1. Nome da plataforma e domínio definitivo — o código já referencia `karollynemorais.com.br`. Confirma?
2. Logo, paleta de cores e fotos profissionais — quem faz, e para quando?
3. Tom de voz: mais acadêmico ou mais próximo?

**Conteúdo**
4. Qual é o tema/especialidade do primeiro curso?
5. O conteúdo já está gravado? Quantas horas, em que formato, onde está hoje?
6. Vai ter professor convidado já no primeiro curso?

**Comercial**
7. Preço do primeiro curso e política de parcelamento
8. Acesso vitalício ou por prazo (12 meses)?
9. **PIX e parcelamento no Stripe** — verificar se a conta Stripe BR tem os dois habilitados. Se não tiver, é um risco comercial real no Brasil e talvez valha avaliar Mercado Pago ou Asaas em paralelo
10. Política de reembolso (além dos 7 dias legais)
11. CNPJ para emissão de nota fiscal — já existe?

**Produto**
12. Certificado: qual carga horária, leva assinatura digitalizada dela? Leva CRM/RQE?
13. Comentários e dúvidas nas aulas entram no MVP ou ficam para a v1.1?
14. Ela quer receber notificação (e-mail/WhatsApp) a cada venda?

**Técnico**
15. Confirmar o provedor e o plano do MySQL atual
16. Criar a conta Cloudflare (Stream + R2) e gerar as credenciais

---

## Apêndice A — Variáveis de ambiente

```bash
# Banco
DATABASE_URL=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudflare Stream
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_STREAM_TOKEN=
CLOUDFLARE_STREAM_KEY_ID=
CLOUDFLARE_STREAM_KEY_JWK=
NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE=

# Cloudflare R2 (materiais privados)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

# Cloudinary (imagens públicas)
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

# E-mail
RESEND_API_KEY=
EMAIL_FROM=

# Rate limit
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cron
CRON_SECRET=
```

---

## Apêndice B — Checklist de setup (Release 0)

- [ ] Confirmar nome, domínio e identidade visual
- [ ] Criar conta Cloudflare, habilitar Stream e criar bucket R2 privado
- [ ] Gerar chave de assinatura do Stream (`KEY_ID` + JWK)
- [ ] Confirmar credenciais e plano do MySQL
- [ ] Confirmar conta Stripe (produto, PIX, parcelamento)
- [ ] Reescrever `prisma/schema.prisma` com o modelo da Parte 8
- [ ] Remover rotas, componentes e dependências do domínio Courtesyfy
- [ ] Criar seed com a conta `ADMIN` da Dra.
- [ ] Ajustar `middleware.ts`, `next.config.ts` (CSP) e `lib/email.ts`
- [ ] Configurar domínio na Vercel e variáveis de ambiente de produção
- [ ] `npm run build` limpo e deploy inicial no ar

---

*Documento vivo. Última atualização: 2026-08-20.*
