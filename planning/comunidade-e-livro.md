# Comunidade, reajuste e o livro como isca

> Continuação de [`area-do-aluno-v2.md`](area-do-aluno-v2.md), escrita a partir
> das suas respostas em 2026-08-20.
>
> ⚠️ Esta parte **exige mudança de schema**. Nada será aplicado no banco antes
> da sua aprovação explícita.

---

## 1. São dois produtos, não um

| Produto | Preço | O que dá | Duração |
|---|---|---|---|
| **Curso avulso** | ~R$ 89,90 | Aquele curso específico | 1 ano |
| **Comunidade** | R$ 49,90/mês | **Todos** os cursos, os que vierem, e as lives | Enquanto pagar |

Isso muda o portão de acesso na raiz. Hoje ele faz uma pergunta:

```
tem matrícula ativa neste curso?
```

Passa a fazer duas:

```
tem matrícula ativa neste curso?   OU   tem assinatura ativa da comunidade?
```

Ainda bem que essa decisão vive num lugar só, em `lib/acesso.ts`. É **uma
função que muda**, não trinta telas. Foi exatamente para isso que centralizei.

### 1.1 Matriz de acesso

| Conteúdo | Visitante | Cadastrado | Comprou o curso | Assinante |
|---|---|---|---|---|
| Trailer do curso | ✅ | ✅ | ✅ | ✅ |
| Ementa: títulos, durações, hints | ✅ | ✅ | ✅ | ✅ |
| Aula 1 (gratuita) | ❌ | ✅ | ✅ | ✅ |
| Demais aulas daquele curso | ❌ | ❌ | ✅ por 1 ano | ✅ |
| Todos os outros cursos | ❌ | ❌ | ❌ | ✅ |
| Lives | ❌ | ❌ | ❌ | ✅ |
| Livro (isca) | ✅ com e-mail | ✅ | ✅ | ✅ |

### 1.2 Três situações que a matriz esconde

Vão acontecer, e é melhor decidir agora:

**1. Assinante cancela, mas já tinha comprado um curso avulso.**
Perde a comunidade, **mantém o curso comprado** até a data original. As duas
concessões são independentes — uma não apaga a outra.

**2. Comprou avulso e depois assinou.**
A compra avulsa continua valendo em paralelo, adormecida. Se cancelar a
assinatura um dia, ainda tem aquele curso. Não descartar o registro.

**3. Assinatura vence sem pagamento.**
Diferente de cancelar. Sugiro alguns dias de tolerância antes de cortar —
cartão recusado acontece o tempo todo, e cortar na hora gera cancelamento por
irritação, não por decisão.

---

## 2. Schema proposto — a aprovar

Nada disso existe hoje.

```prisma
enum IntervaloPlano   { MENSAL ANUAL }
enum StatusAssinatura { ATIVA INADIMPLENTE CANCELADA EXPIRADA }

/// Plano da comunidade. É tabela, e não constante no código, justamente para
/// permitir reajuste sem precisar de deploy.
model Plano {
  id            String @id @default(cuid())
  nome          String                    // "Comunidade"
  slug          String @unique
  descricao     String? @db.Text
  precoCentavos Int                       // preço VIGENTE para novas adesões
  intervalo     IntervaloPlano @default(MENSAL)
  ativo         Boolean @default(true)
  stripePriceId String?
  assinaturas   Assinatura[]
  reajustes     ReajustePlano[]
}

/// Histórico e agendamento de reajustes.
model ReajustePlano {
  id            String @id @default(cuid())
  planoId       String
  precoAnterior Int
  precoNovo     Int
  /// Quando passa a valer para quem JÁ é assinante
  vigenteEm     DateTime
  /// Nulo enquanto agendado; preenchido quando aplicado
  aplicadoEm    DateTime?
  observacao    String?
  plano         Plano @relation(fields: [planoId], references: [id])
  @@index([planoId])
}

model Assinatura {
  id      String @id @default(cuid())
  userId  String
  planoId String
  status  StatusAssinatura @default(ATIVA)

  /// Preço que ESTE assinante paga. Congelado na adesão.
  valorCentavos Int

  iniciadaEm  DateTime  @default(now())
  renovaEm    DateTime              // fim do período pago atual
  canceladaEm DateTime?
  /// Até quando o acesso continua depois de cancelar
  acessoAte   DateTime?

  stripeSubscriptionId String? @unique
  stripeCustomerId     String?

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  plano Plano @relation(fields: [planoId], references: [id])

  @@index([userId])
  @@index([planoId])
  @@index([status])
}
```

**Por que o preço fica congelado na assinatura, e não só no plano:** sem isso,
mudar o preço reajustaria todo mundo retroativamente e sem aviso. O Código de
Defesa do Consumidor não gosta disso, e o assinante menos ainda. Com o
congelamento, o reajuste é um ato deliberado: ela cria o reajuste, define a
data de vigência, e os assinantes antigos são avisados antes.

### 2.1 Mudanças em modelos que já existem

- `Curso.tipoAcesso` passa a nascer `PRAZO_DIAS` com `acessoDias = 365`
- `User` ganha a relação `assinaturas`
- `Aula` ganha `ehLive` e `gravadaEm` — ver seção 3

---

## 3. Lives — preciso de uma definição sua

Você escreveu: *"inclusive as lives ao vivo. Devo usar o OBS para gravar, mas
depois subo na plataforma."*

Essas duas frases descrevem coisas diferentes:

**Opção A — gravar e publicar depois.**
Você grava no OBS, sobe o arquivo, vira aula normal. **Já funciona hoje**, custo
zero de desenvolvimento. Mas aí não é ao vivo: é aula nova. Vender como "live"
gera frustração em quem entrou para participar ao vivo.

**Opção B — transmissão ao vivo de verdade.**
O OBS transmite por RTMP direto para um *Live Input* do Cloudflare Stream. O
aluno assiste em tempo real e o Cloudflare **grava sozinho** — a gravação vira
aula depois, automaticamente.

**Recomendo a B.** É o que sustenta o argumento de venda da comunidade, o
Cloudflare que você já contratou faz isso (mesmo produto, outro recurso), e você
fica com as duas coisas: o evento ao vivo e o acervo. O esforço extra é pequeno:
um Live Input e uma tela de "ao vivo agora".

---

## 4. O livro como isca

O funil que sua esposa descreveu é clássico e funciona bem.

### 4.1 O fluxo

```
Link da bio do Instagram
        ↓
  /livro — capa, sinopse, sobre a autora, formulário
        ↓
  nome + e-mail
        ↓
  conta criada · download começa na hora
        ↓
  e-mail com o livro + link para definir a senha
        ↓
  cai em /aluno — cursos já visíveis, aula 1 liberada
```

O ponto do funil é esse último passo: ela veio pelo livro e sai olhando os
cursos, já com uma aula desbloqueada para assistir.

### 4.2 A decisão que importa: quanto atrito no formulário

| Opção | Atrito | O que você ganha |
|---|---|---|
| Só e-mail | mínimo | Uma lista de e-mails. Nada mais |
| **Nome + e-mail, conta sem senha** | **baixo** | **Conta de verdade** — ela já entra e vê os cursos |
| Nome + e-mail + senha | médio | Conta completa, mas perde gente no formulário |

**Recomendo a do meio.** A conta nasce sem senha, o livro baixa na hora, e o
e-mail traz um link para definir a senha quando ela quiser. Sai com o livro e
com um pé dentro da plataforma, sem ter sentido que preencheu um cadastro.

A infraestrutura já existe: `AuthToken` tem tipo — basta acrescentar
`DEFINIR_SENHA`.

### 4.3 Schema do livro

```prisma
model Ebook {
  id         String @id @default(cuid())
  slug       String @unique
  titulo     String
  subtitulo  String?
  descricao  String? @db.Text
  capaUrl    String?
  /// Chave no bucket privado (R2). O arquivo nunca é URL pública.
  arquivoKey String
  paginas    Int?
  publicado  Boolean @default(false)
  downloads  DownloadEbook[]
}

model DownloadEbook {
  id      String @id @default(cuid())
  ebookId String
  userId  String
  /// De onde veio: utm_source, "instagram", "bio"…
  origem  String?
  ip      String? @db.VarChar(45)
  criadoEm DateTime @default(now())
  ebook   Ebook @relation(fields: [ebookId], references: [id], onDelete: Cascade)
  user    User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([ebookId])
  @@index([userId])
}
```

`origem` existe para responder a pergunta que ela vai fazer no primeiro mês:
*"de onde vieram as pessoas que baixaram?"*

### 4.4 Três cuidados

1. **O PDF precisa do R2**, que ainda não foi criado. Sem ele, o livro não tem
   onde morar.
2. **Carimbe o e-mail no rodapé de cada PDF baixado.** Livro gratuito circula —
   carimbado, você sabe por onde circulou. `pdf-lib` faz na hora do download.
3. **LGPD:** captar e-mail em troca de material exige dizer o que será feito com
   ele. Uma linha no formulário — *"você receberá novidades sobre os cursos e
   pode sair quando quiser"* — resolve, e evita dor de cabeça depois.

---

## 5. Ordem revisada

| # | Etapa | Mexe no banco? | Depende de |
|---|---|---|---|
| 1 | Paleta escura (preto neutro + verde de acento) | não | — |
| 2 | Campo de capa no formulário de curso | não | — |
| 3 | Campo de descrição da aula (o hint) | não | — |
| 4 | Card de fora a fora + caixinhas + hint | não | 1,2,3 |
| 5 | `/aluno` lista todos os cursos publicados | não | 4 |
| 6 | Primeira aula nasce gratuita | não | — |
| 7 | `tipoAcesso` padrão vira 365 dias | não | — |
| 8 | **Schema: Plano, Assinatura, ReajustePlano** | **sim** | sua aprovação |
| 9 | Portão de acesso considera assinatura | sim | 8 |
| 10 | Painel do cadeado: comprar curso **ou** assinar | não | 4, 9 |
| 11 | Painel: plano, reajustes e assinantes | sim | 8 |
| 12 | **Schema: Ebook, DownloadEbook** | **sim** | sua aprovação |
| 13 | Página `/livro` + captura + download | sim | 12, R2 |
| 14 | Lives com Live Input do Cloudflare | sim | decisão da seção 3 |
| 15 | Checkout Stripe: avulso + recorrente | não | 8, 9 |
| 16 | Cron de expiração + avisos D-30 e D-7 | não | 7, 8 |

**As etapas 1 a 7 não tocam no banco e não dependem de nenhuma decisão
pendente.** É por onde começo.

---

*Atualizado em: 2026-08-20*
