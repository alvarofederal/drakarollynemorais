# Área do aluno v2 — visual, trilha e trava de acesso

> Plano para aprovação antes da implementação.
> Escrito em 2026-08-20, a partir do pedido: fundo preto, card de curso de fora
> a fora com caixinhas de aula, capa personalizada, primeira aula grátis e o
> resto pago com acesso por um ano.

---

## 1. O que muda no visual

### 1.1 A paleta escura tem verde demais

Hoje o fundo é `#070a09` — preto puxando para o verde. Numa tela grande isso
lê como "tema esverdeado", não como preto.

| Token | Hoje | Proposto | Papel |
|---|---|---|---|
| `--km-bg` | `#070a09` | `#08090A` | Fundo: preto neutro, levemente frio |
| `--km-surface` | `#0f1512` | `#111214` | Card |
| `--km-sunk` | `#0b100e` | `#0C0D0F` | Faixa recuada |
| `--km-line` | `#1e2723` | `#212327` | Traço |
| `--km-ink` | `#e9efeb` | `#F2F3F5` | Texto |
| `--km-ink-soft` | `#a3afa9` | `#A1A5AD` | Texto secundário |
| `--km-ink-faint` | `#6f7b75` | `#6B7079` | Texto terciário |
| `--km-brand` | `#46b394` | `#34D399` | Verde de acento |

O verde some do fundo e passa a aparecer **só onde significa alguma coisa**:
barra de progresso, selo de aula gratuita, aula atual, botão principal, ícone
de aula concluída. É o que faz o verde ter peso — hoje ele compete com o fundo.

Sobre o `#34D399`: um verde mais vivo que o atual. Verde profundo morre em
fundo preto; num tema escuro o acento precisa de luminosidade para funcionar
como sinal. O tema claro continua com o verde cirúrgico atual.

### 1.2 O card de curso, de fora a fora

```
┌──────────────────────────────────────────────────────────────────────┐
│  [capa do curso ocupando a faixa, com gradiente escuro por cima]      │
│                                                                       │
│  OSTEOMETABÓLICA                            6 aulas · 6h · 1 ano      │
│  Estudar osteometabólicas                                             │
│  ▓▓▓▓▓▓░░░░░░░░░░░░  38% concluído                   [ Continuar → ]  │
├───────────────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │  01  ✓ │ │  02  🔒│ │  03  🔒│ │  04  🔒│ │  05  🔒│ │  06  🔒│ → │
│  │        │ │        │ │        │ │        │ │        │ │        │   │
│  │ Intro  │ │ Aval.  │ │ Conduta│ │ Casos  │ │ Exames │ │ Final  │   │
│  │ 6 min  │ │ 18 min │ │ 24 min │ │ 31 min │ │ 12 min │ │ 9 min  │   │
│  │ GRÁTIS │ │        │ │        │ │        │ │        │ │        │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

Um card por curso, empilhados. Criar um curso novo no painel gera outro card
igual, com as caixinhas das aulas dele. Sem limite de cursos.

**Estados da caixinha**

| Estado | Como aparece |
|---|---|
| Concluída | Borda verde, ✓ no canto |
| Em andamento | Contorno verde aceso, "continuar" |
| Liberada | Neutra, clicável |
| Gratuita | Selo `GRÁTIS` em verde |
| Bloqueada | Escurecida, cadeado, cursor de "não permitido" |
| Sem vídeo ainda | Cinza, "em breve" — não clicável |

**O hint.** Passar o mouse (ou tocar, no celular) abre um balão com a descrição
da aula: o que vai ser visto ali. Isso serve para dois públicos ao mesmo tempo —
o aluno matriculado se orienta, e o não matriculado entende o que está perdendo.
É o argumento de venda embutido na própria trilha.

**No celular** as caixinhas viram uma fita que rola na horizontal, com encaixe
(scroll-snap). O card continua de fora a fora.

### 1.3 Capa personalizada

O campo `capaUrl` já existe no banco e o upload para o Cloudinary já funciona
(`/api/upload`) — falta só o campo no formulário de curso.

Proporção recomendada: **21:9** (ex.: 1680×720). É uma faixa larga, não um
quadrado. Sem capa, o card cai num degradê da cor da marca com o título grande —
continua apresentável, não fica quebrado.

---

## 2. O modelo de acesso

### 2.1 A regra

1. Aluno cria a conta → vê **todos os cursos publicados**
2. Em cada curso, a **primeira aula é gratuita** e explica o que o curso cobre
3. As demais têm cadeado
4. Clicar no cadeado → tela de pagamento
5. Pagou → acesso ao curso por **um ano**

### 2.2 O que o banco já suporta

Quase tudo:

| Necessidade | Campo | Situação |
|---|---|---|
| Aula gratuita | `Aula.gratuita` | ✅ existe |
| Acesso por prazo | `Curso.tipoAcesso = PRAZO_DIAS` | ✅ existe |
| Duração do prazo | `Curso.acessoDias = 365` | ✅ existe |
| Data de expiração | `Matricula.expiraEm` | ✅ existe e já é respeitada |
| Capa | `Curso.capaUrl` | ✅ existe |
| Hint da aula | `Aula.descricao` | ✅ existe |

**Nenhuma mudança de schema é necessária.** Só muda o padrão: `tipoAcesso`
passa a nascer `PRAZO_DIAS` com `acessoDias = 365`.

### 2.3 O que falta de verdade

| Falta | Impacto |
|---|---|
| **Checkout não existe** | O cadeado não tem para onde mandar |
| **Sem campo de capa no formulário** | Não dá para subir a imagem |
| **Sem campo de descrição da aula** | O hint não tem conteúdo — a ação `atualizarAula` aceita `descricao`, mas nenhuma tela chama |
| `/aluno` só lista curso matriculado | Aluno novo veria uma tela vazia, sem os cadeados |
| Nada marca a matrícula como `EXPIRADA` | O acesso para na data (`verificarAcesso` confere), mas o status fica `ATIVA` e os relatórios mentem |

---

## 3. Insights — o que eu mudaria no plano

### 3.1 Separe "trailer" de "aula gratuita"

São duas coisas diferentes e o schema já tem espaço para as duas:

- **`Curso.trailerVideoUid`** — vídeo curto na página de vendas, **sem login**.
  Quem chega pelo Instagram assiste na hora.
- **`Aula.gratuita`** — aula de verdade, **exige cadastro**. É a isca que
  converte visitante em conta, e conta em cliente.

Usar as duas cria um funil em degraus: assiste o trailer → cria conta para a
aula grátis → compra. Usar só a aula gratuita pula o primeiro degrau.

### 3.2 O cadeado deve abrir um painel, não pular de página

Mandar direto para o checkout perde a pessoa. Melhor: abrir um painel ali
mesmo com o que ela ganha (nº de aulas, carga horária, certificado), o preço,
o que ela **já viu** de graça, e o botão. Menos atrito e a decisão acontece no
contexto — não numa página nova onde ela esqueceu o porquê.

### 3.3 "Primeira aula" deve ser um selo, não uma posição

Marcar automaticamente a aula de `ordem = 0` parece prático, mas quebra no dia
em que ela reordenar os módulos — e ela já reordenou uma vez.

Proposta: ao criar a **primeira aula de um curso**, o sistema marca
`gratuita = true` sozinho. Depois disso, é uma chave que ela liga e desliga em
qualquer aula. Assim funciona sem configuração, mas não engessa: ela pode
liberar duas aulas, ou liberar a aula 3 em vez da 1.

### 3.4 Avise antes de expirar, não depois

Acesso de um ano significa que **todo aluno vira um vencimento**. Sem aviso, o
aluno descobre que perdeu o acesso ao tentar entrar — e isso vira reclamação,
não renovação.

Sugestão: e-mail em D-30 e D-7, e uma faixa na área do aluno no último mês.
Barato de fazer junto, caro de fazer depois que o primeiro aluno reclamar.

### 3.5 Diga que o progresso não se perde

O sistema já preserva progresso e certificado quando o acesso acaba. Isso é um
argumento de renovação forte e hoje ninguém sabe: *"suas 14 aulas concluídas
continuam aqui"*. Vale escrever na tela de renovação.

### 3.6 A mesma trilha serve para vender

A grade de caixinhas com cadeado é boa demais para ficar só na área logada.
O mesmo componente, na página pública do curso, mostra a ementa completa com
os cadeados — que é exatamente o que a página de vendas já tenta fazer hoje com
uma lista simples. Um componente, dois lugares.

### 3.7 Endurecer: não buscar `videoUid` de aula bloqueada

Hoje `obterSalaDeAula` traz o `videoUid` de **todas** as aulas, inclusive as
bloqueadas. Conferi: esse dado **não chega ao navegador** hoje, porque a trilha
é renderizada no servidor e não vira prop de componente cliente.

Mas é frágil — basta alguém passar a trilha para um componente `"use client"`
e o identificador de todos os vídeos vai junto para o HTML. Como o vídeo exige
token assinado, não seria explorável de imediato, mas é exposição sem motivo.
Correção: só selecionar `videoUid` quando a aula estiver liberada.

### 3.8 Cadeado precisa de texto, não só ícone

Leitor de tela não enxerga ícone. Cada caixinha bloqueada precisa de rótulo
("Aula 3, bloqueada — assine para desbloquear"). Custa uma linha e evita
refazer depois.

---

## 4. Perguntas que preciso que você responda

1. **Preço e prazo.** R$ 497 por um ano, por curso? Ou um valor que dá acesso a
   tudo?
2. **Renovação.** No fim do ano: paga de novo o mesmo valor, ou preço de
   renovação menor?
3. **Aluno novo vê todos os cursos** na área dele, ou só os que comprou (com os
   outros numa aba "disponíveis")?
4. **Checkout agora ou depois?** Sem Stripe ligado, o cadeado pode abrir o
   painel com um botão de WhatsApp em vez do pagamento. Funciona para as
   primeiras turmas e não trava o resto.
5. **Aula gratuita por curso ou uma só?** Você descreveu "a primeira, que explica
   o que tem em cada curso" — entendi como uma por curso. Confirma?

---

## 5. Ordem de implementação sugerida

| # | Etapa | Depende de |
|---|---|---|
| 1 | Nova paleta escura (preto neutro + verde de acento) | — |
| 2 | Campo de capa no formulário de curso | — |
| 3 | Campo de descrição na aula (conteúdo do hint) | — |
| 4 | Card de curso de fora a fora + caixinhas + hint | 1, 2, 3 |
| 5 | `/aluno` passa a listar todos os cursos publicados | 4 |
| 6 | Primeira aula nasce gratuita; chave para editar | — |
| 7 | Painel do cadeado (com WhatsApp por enquanto) | 4 |
| 8 | `tipoAcesso` padrão vira `PRAZO_DIAS` / 365 | — |
| 9 | Checkout Stripe + matrícula automática de 1 ano | 7, 8 |
| 10 | Cron de expiração + avisos D-30 e D-7 | 8 |

As etapas 1 a 8 não dependem do Stripe. Dá para ter a experiência inteira em pé,
vendendo por WhatsApp, e ligar o pagamento depois sem refazer tela nenhuma.

---

*Atualizado em: 2026-08-20*
