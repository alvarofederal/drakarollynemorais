# Banco de Dados

**MySQL + Prisma 5**, `relationMode = "prisma"` — **não há foreign key no banco**.
Todo campo de relação precisa de `@@index`. Integridade referencial e cascata são
responsabilidade da aplicação.

> ⚠️ O schema atual (`prisma/schema.prisma`) ainda é o do **Courtesyfy**.
> A reescrita para o modelo abaixo é a primeira tarefa do Release 0.
> Modelo completo e comentado: [`spec.md`](../spec.md) → Parte 8.

## Modelos planejados

### Autenticação (reaproveitado)
`User` · `Account` · `Session` · `VerificationToken` · `AuthToken` · `LoginAttempt`

Mudanças no `User`:
- **sai** `lojaId`
- **entra** `cpf` (único, opcional — necessário para o certificado), `telefone`
- `role` passa a ser `ADMIN | EQUIPE | ALUNO`, padrão `ALUNO`

### Conteúdo
`Professor` · `Categoria` · `Curso` · `Modulo` · `Aula` · `Material`

### Acesso
`Matricula` · `ProgressoAula` · `Certificado`

### Comércio
`Pedido` · `Cupom`

### Apoio
`Depoimento` · `Faq` · `ConfigPlataforma` · `LogEvento`

## Enums

| Enum | Valores |
|---|---|
| `Role` | `ADMIN` `EQUIPE` `ALUNO` |
| `StatusCurso` | `RASCUNHO` `PUBLICADO` `ARQUIVADO` |
| `NivelCurso` | `INTRODUTORIO` `INTERMEDIARIO` `AVANCADO` |
| `TipoAcesso` | `VITALICIO` `PRAZO_DIAS` |
| `TipoAula` | `VIDEO` `TEXTO` `PDF` |
| `TipoMaterial` | `PDF` `SLIDE` `PLANILHA` `LINK` `IMAGEM` |
| `OrigemMatricula` | `COMPRA` `CORTESIA` `IMPORTACAO` |
| `StatusMatricula` | `ATIVA` `EXPIRADA` `CANCELADA` `REEMBOLSADA` |
| `StatusPedido` | `PENDENTE` `PAGO` `FALHOU` `REEMBOLSADO` |
| `TipoCupom` | `PERCENTUAL` `VALOR_FIXO` |

## Chaves únicas importantes

| Modelo | Restrição | Por quê |
|---|---|---|
| `Curso` | `slug` único | URL pública |
| `Matricula` | `@@unique([userId, cursoId])` | Um aluno não se matricula duas vezes no mesmo curso |
| `ProgressoAula` | `@@unique([userId, aulaId])` | Um registro de progresso por aula por aluno |
| `Certificado` | `codigo` único | Validação pública |
| `Certificado` | `matriculaId` único | Um certificado por matrícula |
| `Pedido` | `stripeSessionId` único | **Garante a idempotência do webhook** |
| `User` | `email` único, `cpf` único | — |

## Queries comuns

### Verificar acesso a um curso
```typescript
const matricula = await db.matricula.findUnique({
  where: { userId_cursoId: { userId, cursoId } },
  select: { status: true, expiraEm: true },
})
const temAcesso =
  matricula?.status === "ATIVA" &&
  (!matricula.expiraEm || matricula.expiraEm > new Date())
```

### Cursos do aluno com progresso
```typescript
await db.matricula.findMany({
  where: { userId, status: "ATIVA" },
  include: { curso: { select: { slug: true, titulo: true, capaUrl: true } } },
  orderBy: { iniciadaEm: "desc" },
})
```

### Recalcular percentual da matrícula
```typescript
const [total, concluidas] = await Promise.all([
  db.aula.count({ where: { modulo: { cursoId }, publicada: true } }),
  db.progressoAula.count({ where: { userId, concluida: true, aula: { modulo: { cursoId } } } }),
])
const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100)
```

### Trilha completa do curso
```typescript
await db.curso.findUnique({
  where: { slug },
  include: {
    modulos: {
      orderBy: { ordem: "asc" },
      include: { aulas: { where: { publicada: true }, orderBy: { ordem: "asc" } } },
    },
  },
})
```

## Comandos

```bash
npx prisma generate          # regenera o client
npx prisma db push           # aplica schema (CUIDADO: --accept-data-loss apaga dados)
npx prisma studio            # inspeção visual
npm run db:seed              # cria a conta ADMIN da Dra.
npx tsx scripts/check-db.ts  # verificação rápida de conexão
```

---

*Atualizado em: 2026-08-20*
