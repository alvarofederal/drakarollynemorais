# Plataforma de Cursos — Dra. Karollyne Morais — Guia para Claude Code

> Este arquivo é carregado automaticamente pelo Claude Code em toda sessão.
> Leia-o completamente antes de fazer qualquer alteração no projeto.

---

## O que é este projeto?

Plataforma de cursos online (área de membros) da **Dra. Karollyne Morais**, médica.
Ela publica cursos com aulas em vídeo, slides e PDFs; alunos compram, assistem, acompanham
o progresso e recebem certificado de conclusão.

**Stack:** Next.js 16 (App Router) + TypeScript + MySQL (Prisma) + Stripe + Cloudflare Stream + Vercel
**Versão atual:** 0.1.0 (pré-MVP) | **Branch ativo:** main | **Status:** em construção — Release 0

⚠️ **Este repositório nasceu de um fork do Courtesyfy** (SaaS de chaves promocionais). Boa
parte da infraestrutura é reaproveitada, mas **todo o domínio de chaves/campanhas/lojas está
sendo removido**. Se você encontrar código de `Chave`, `Campanha`, `Loja`, `Resgate`,
`LoteChave` ou `SolicitacaoImpressao`, é legado a ser apagado — não construa em cima dele.

---

## Documento mestre

**[`spec.md`](spec.md)** é a especificação completa do projeto — visão, personas, requisitos
funcionais com critérios de aceite, modelo de dados, arquitetura, releases, custos e riscos.
**Leia antes de propor qualquer feature.**

---

## Arquivos de contexto

| Arquivo | Quando ler |
|---------|-----------|
| `spec.md` | **Sempre.** Especificação completa do produto |
| `context/system.md` | Visão geral, atores, stack, integrações |
| `context/architecture.md` | Estrutura de pastas, padrões de código |
| `context/rules.md` | Convenções, checklist, o que nunca fazer |
| `planning/roadmap.md` | Releases R0 a R4 e o que vem depois |
| `planning/backlog.md` | Funcionalidades priorizadas |
| `planning/releases.md` | Histórico de versões |
| `development/features.md` | O que está em andamento agora |
| `development/bugs.md` | Bugs conhecidos |
| `development/improvements.md` | Melhorias técnicas planejadas |
| `knowledge/database.md` | Schema Prisma, enums, queries comuns |
| `knowledge/api.md` | Endpoints e padrões de Server Actions |
| `knowledge/domain.md` | Vocabulário, regras de negócio, estados |

---

## Regras Críticas — NUNCA ignore

1. **A matrícula ativa é o único portão de acesso.** Nenhuma rota de conteúdo confia em
   sessão, cookie ou parâmetro de URL — sempre consulta `Matricula` no servidor
2. **Vídeo nunca é servido por URL pública** — sempre token assinado gerado no servidor
   depois de validar a matrícula, com expiração de no máximo 2 horas
3. **Material (PDF/slide) nunca é servido por URL pública** — rota autenticada que emite
   URL temporária de 60 segundos
4. **Webhook de pagamento é idempotente** — `stripeSessionId` é único; reprocessar o mesmo
   evento nunca duplica pedido ou matrícula
5. **Certificado emitido é imutável** — os dados são congelados na emissão, nunca recalculados
6. **Progresso e certificado nunca são apagados** por cancelamento, reembolso ou expiração;
   só o acesso é revogado
7. **Curso arquivado não tira acesso de quem já comprou**
8. **Não alterar schema Prisma** sem confirmar — `db push --accept-data-loss` apaga dados
9. **Não mudar o sistema de autenticação** (NextAuth) sem discussão
10. **Sempre validar inputs com Zod** nas Server Actions e API Routes
11. **Role de administradora é `ADMIN`** (a Dra.). Alunos são `ALUNO`. Nunca confundir

---

## Padrões Obrigatórios

### Server Action
```typescript
"use server"
const session = await auth()
if (!session?.user) return { error: "Não autorizado" }
// valida com Zod → verifica papel/matrícula → executa → revalidatePath
```

### Verificação de acesso a conteúdo
```typescript
const matricula = await db.matricula.findUnique({
  where: { userId_cursoId: { userId: session.user.id, cursoId } },
})
const temAcesso =
  matricula?.status === "ATIVA" &&
  (!matricula.expiraEm || matricula.expiraEm > new Date())
if (!temAcesso) redirect(`/cursos/${slug}`)
```

### Verificação de permissão de administradora
```typescript
const session = await auth()
if (session?.user?.role !== "ADMIN") redirect("/aluno")
```

### Importações
```typescript
import { db } from "@/lib/prisma"       // sempre assim
import { auth } from "@/lib/auth"       // sempre assim
import { cn } from "@/lib/utils"        // para classnames
import { stripe } from "@/lib/stripe"   // para Stripe
```

### Componentes
```typescript
// Server Component (padrão) → busca dados direto
// Client Component → React Query ou Server Action
"use client" // só quando necessário (hooks, eventos, formulários, player)
```

---

## Integrações

| Serviço | Uso | Situação |
|---|---|---|
| **Cloudflare Stream** | Hospedagem e entrega de vídeo com URL assinada | 🆕 a integrar |
| **Cloudflare R2** | Bucket privado de PDFs e slides | 🆕 a integrar |
| **Stripe** | Checkout de curso + webhook de matrícula | ✅ base pronta, adaptar |
| **Cloudinary** | Imagens públicas (capas, avatares) | ✅ pronto |
| **Resend** | E-mails transacionais (React Email) | ✅ pronto |
| **Upstash Redis** | Rate limit | ✅ pronto |
| **NextAuth v5** | Credentials + Google + GitHub | ✅ pronto |

Variáveis de ambiente: ver `spec.md` → Apêndice A.

---

## Mapa de Telas (planejado)

### Públicas
| Rota | Descrição |
|------|-----------|
| `/` | Landing page (referência visual: lp.cademi.com.br) |
| `/cursos` | Catálogo de cursos |
| `/cursos/[slug]` | Página de vendas do curso |
| `/professores/[slug]` | Perfil do professor convidado |
| `/certificados/[codigo]` | Validação pública de certificado |
| `/login` `/cadastro` `/recuperar-senha` | Autenticação |

### Área do aluno (`/aluno/*`)
| Rota | Descrição |
|------|-----------|
| `/aluno` | Meus cursos e progresso |
| `/aluno/curso/[slug]/[aulaSlug]` | Sala de aula: player + materiais |
| `/aluno/certificados` | Certificados emitidos |
| `/aluno/perfil` | Dados pessoais e CPF |

### Painel da Dra. (`/admin/*`)
| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard de resultados |
| `/admin/cursos/[id]` | Editor de curso, módulos e aulas |
| `/admin/alunos` | Gestão de alunos e matrículas |
| `/admin/pedidos` | Vendas e status de pagamento |
| `/admin/configuracoes` | Marca, textos da landing, contato |

---

## Branch e Workflow

```bash
# Branch principal (deploy automático no Vercel)
main

# Nova feature
git checkout -b feature/nome-da-feature
git commit -m "descrição clara do que foi feito"
git push origin feature/nome-da-feature

# Verificar build antes de merge
npm run build
```

---

## O que está sendo desenvolvido AGORA

Ver `development/features.md`.

**Resumo rápido (2026-08-20):**
- Projeto recém-iniciado. `spec.md` escrita e validada nas 4 decisões estruturais
- **Release 0 (fundação):** limpar o legado do Courtesyfy, reescrever o schema Prisma,
  criar conta Cloudflare, definir marca e domínio
- Próximo marco: **R1 — núcleo do conteúdo** (painel de cursos + sala de aula)

---

## Como atualizar os arquivos de contexto

- Nova feature concluída → `planning/releases.md` + `development/features.md`
- Bug encontrado → `development/bugs.md`
- Decisão arquitetural → `context/architecture.md` (e ADR em `docs/adr/` se for relevante)
- Nova regra de negócio → `knowledge/domain.md` + `context/rules.md`
- Novo endpoint → `knowledge/api.md`
- Mudança no banco → `knowledge/database.md`
- Mudança de escopo do produto → `spec.md`

---

*Criado em: 2026-08-20 | Atualizado em: 2026-08-20*
