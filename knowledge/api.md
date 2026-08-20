# API e Server Actions

> Rotas planejadas. Nenhuma implementada ainda — ver `development/features.md`.

## API Routes

| Rota | Método | Autenticação | Descrição |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | Handlers NextAuth |
| `/api/checkout` | POST | Sessão | Cria Stripe Checkout Session para um curso |
| `/api/webhook/stripe` | POST | Assinatura Stripe | Cria matrícula, processa reembolso |
| `/api/webhook/stream` | POST | Assinatura Cloudflare | Atualiza duração e status do vídeo |
| `/api/video/[aulaId]/token` | GET | Sessão + matrícula | Token assinado do player (exp ≤ 2h) |
| `/api/materiais/[id]/download` | GET | Sessão + matrícula | 302 para presigned URL do R2 (60s) |
| `/api/upload/video` | POST | `ADMIN` | Cria URL de upload direto no Cloudflare Stream |
| `/api/upload/imagem` | POST | `ADMIN` | Upload de imagem no Cloudinary |
| `/api/certificados/[codigo]` | GET | Pública | Dados de validação do certificado |
| `/api/cron/expirar-matriculas` | GET | `CRON_SECRET` | Expira matrículas com prazo vencido |

## Padrão de API Route

```typescript
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  // regra de negócio → persistência → LogEvento
  return NextResponse.json({ ok: true })
}
```

## Padrão de webhook (idempotente)

```typescript
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

if (event.type === "checkout.session.completed") {
  const s = event.data.object as Stripe.Checkout.Session

  // idempotência: stripeSessionId é único no banco
  const existente = await db.pedido.findUnique({ where: { stripeSessionId: s.id } })
  if (existente?.status === "PAGO") return NextResponse.json({ received: true })

  await db.$transaction([ /* Pedido PAGO + Matricula ATIVA + LogEvento */ ])
}
```

## Server Actions

Organizadas em `_actions/` junto da rota que as usa.

| Ação | Local | Papel |
|---|---|---|
| `criarCurso` `atualizarCurso` `publicarCurso` | `admin/cursos/_actions` | `ADMIN` |
| `criarModulo` `reordenarModulos` | `admin/cursos/_actions` | `ADMIN` |
| `criarAula` `atualizarAula` `reordenarAulas` | `admin/cursos/_actions` | `ADMIN` |
| `anexarMaterial` `removerMaterial` | `admin/cursos/_actions` | `ADMIN` |
| `concederMatricula` `revogarMatricula` | `admin/matriculas/_actions` | `ADMIN` |
| `salvarProgresso` `concluirAula` | `aluno/_actions` | `ALUNO` + matrícula |
| `emitirCertificado` | `aluno/_actions` | `ALUNO` + conclusão |
| `atualizarPerfil` | `aluno/perfil/_actions` | Sessão |

### Padrão

```typescript
"use server"

export async function salvarProgresso(input: unknown) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }

  const parsed = progressoSchema.safeParse(input)
  if (!parsed.success) return { error: "Dados inválidos" }

  await exigirAcesso(session.user.id, parsed.data.cursoId)

  // executa
  revalidatePath(`/aluno/curso/${slug}`)
  return { ok: true }
}
```

## Formato de retorno

Server Actions retornam `{ ok: true, data? }` ou `{ error: string }`.
Nunca lançam exceção para erro esperado — exceção é só para falha real de infraestrutura.

---

*Atualizado em: 2026-08-20*
