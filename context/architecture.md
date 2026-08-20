# Arquitetura Técnica

## Visão geral

```
Cliente (browser / celular)
    ↓
Next.js App Router (Server Components + Client Components)
    ↓
Server Actions  |  API Routes
    ↓
Camada de acesso a dados (_data/)
    ↓
Prisma ORM → MySQL

Fora do fluxo principal:
  Cloudflare Stream  → vídeo (token assinado, entrega direta ao browser)
  Cloudflare R2      → materiais (presigned URL, entrega direta ao browser)
  Stripe             → pagamento (checkout hospedado + webhook de volta)
```

**Princípio:** conteúdo pesado (vídeo, PDF) nunca trafega pelo nosso servidor. Nós só
autorizamos e assinamos; a entrega é feita pelo Cloudflare direto ao aluno.

## Estrutura de diretórios alvo

```
src/
├── app/
│   ├── (public)/                  # landing, catálogo, página de curso, legal
│   │   ├── page.tsx               # landing
│   │   ├── cursos/
│   │   ├── professores/[slug]/
│   │   └── certificados/[codigo]/
│   ├── (auth)/                    # login, cadastro, verificação, recuperação
│   ├── (aluno)/aluno/             # área de membros
│   │   ├── page.tsx               # meus cursos
│   │   ├── curso/[slug]/[aulaSlug]/
│   │   ├── certificados/
│   │   └── perfil/
│   ├── (admin)/admin/             # painel da Dra.
│   │   ├── cursos/
│   │   ├── alunos/
│   │   ├── pedidos/
│   │   └── configuracoes/
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── checkout/
│       ├── webhook/stripe/
│       ├── webhook/stream/
│       ├── video/[aulaId]/token/
│       ├── materiais/[id]/download/
│       ├── upload/
│       └── cron/expirar-matriculas/
├── components/
│   ├── ui/                        # shadcn/ui
│   ├── player/                    # player + marca d'água + progresso
│   └── emails/                    # React Email
├── lib/
│   ├── prisma.ts   auth.ts   stripe.ts   email.ts
│   ├── stream.ts                  # Cloudflare Stream (upload + assinatura)
│   ├── r2.ts                      # Cloudflare R2 (presigned URLs)
│   ├── acesso.ts                  # verificação de matrícula — ponto único
│   ├── certificado.ts             # geração do PDF
│   └── validators/                # schemas Zod
└── generated/prisma/              # client gerado
```

**Convenções de colocation** (herdadas do projeto base, mantidas):
- `_actions/` — Server Actions da rota
- `_components/` — componentes exclusivos da rota
- `_data/` — funções de leitura do banco

## Padrões

### Ponto único de verificação de acesso

Toda verificação de matrícula passa por `src/lib/acesso.ts`. Nenhuma rota implementa a
própria checagem — isso evita que uma tela nova esqueça uma condição (expiração, reembolso).

```typescript
// src/lib/acesso.ts
export async function verificarAcesso(userId: string, cursoId: string)
export async function exigirAcesso(userId: string, cursoId: string)  // lança/redireciona
```

### Server Action

```typescript
"use server"
const session = await auth()
if (!session?.user) return { error: "Não autorizado" }
const parsed = schema.safeParse(input)
if (!parsed.success) return { error: "Dados inválidos" }
// verifica papel ou matrícula → executa → registra LogEvento → revalidatePath
```

### Server Component por padrão

Client Component só quando há hook, evento, formulário ou player. A sala de aula é o
principal caso legítimo de `"use client"`.

### Prisma com `relationMode = "prisma"`

Não há foreign key no banco. Consequências:
- **Todo campo de relação precisa de `@@index`**
- Deleção em cascata é responsabilidade da aplicação
- Integridade referencial é responsabilidade da aplicação

## Decisões arquiteturais

| # | Decisão | Motivo |
|---|---|---|
| A1 | Upload de vídeo direto do browser para o Cloudflare | Contorna o limite de 4,5 MB de body da Vercel e não consome nossa banda |
| A2 | Token de vídeo assinado no servidor, expiração ≤ 2h | Link copiado não funciona fora da sessão autorizada |
| A3 | Materiais em bucket privado com presigned URL de 60s | Mesmo raciocínio do vídeo, para PDFs e slides |
| A4 | Marca d'água como overlay HTML, não no vídeo | Permite dado por aluno sem reprocessar o vídeo |
| A5 | Snapshot dos dados no certificado | Certificado é documento; não pode mudar retroativamente |
| A6 | Idempotência do webhook por `stripeSessionId` único | Stripe reentrega eventos; matrícula duplicada seria bug de negócio |
| A7 | Landing e catálogo em ISR | A vitrine continua no ar mesmo com o banco indisponível |

Decisões relevantes ganham um ADR em `docs/adr/NNNN-titulo.md`.

## Segurança

- Headers de segurança em `next.config.ts` (CSP, X-Frame-Options, nosniff, Referrer-Policy)
- CSP precisa liberar `cloudflarestream.com` e o domínio do R2
- Rate limit no login e no checkout (Upstash)
- Nenhum dado de cartão passa pela aplicação — Stripe Checkout hospedado
- Senhas com bcrypt

---

*Atualizado em: 2026-08-20*
