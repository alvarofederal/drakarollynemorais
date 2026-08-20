# Melhorias Técnicas Planejadas

Dívida técnica e melhorias de infraestrutura. Não são features de produto.

---

## 🔴 Alta prioridade

### Trocar `db push` por migrations no build
**Onde:** `package.json` → script `build`
Hoje o build roda `prisma db push --accept-data-loss`. Aceitável num projeto sem dados reais;
inaceitável com alunos pagantes no banco. Migrar para `prisma migrate deploy` antes do R2.

### Ajustar o CSP para o Cloudflare
**Onde:** `next.config.ts`
`cloudflarestream.com` em `frame-src`, `media-src` e `connect-src`; domínio do R2 em
`connect-src`. Sem isso, player e download não funcionam.

### Rate limit no checkout e no token de vídeo
**Onde:** `/api/checkout`, `/api/video/[aulaId]/token`
O Upstash já está configurado. O endpoint de token é o mais sensível: sem limite, uma conta
comprometida consegue gerar tokens em massa.

### Alerta de consumo do Cloudflare Stream
O custo de entrega escala com o número de alunos. Precisa de um alerta antes de estourar o
orçamento, não depois da fatura.

---

## 🟡 Média prioridade

### Testes do fluxo crítico
O Vitest já está configurado. Cobertura mínima antes do lançamento:
- Verificação de acesso (`lib/acesso.ts`) — todos os estados de matrícula
- Idempotência do webhook do Stripe
- Cálculo de percentual de conclusão
- Emissão e imutabilidade do certificado

### Camada `_data/` para leituras
Padronizar as consultas de leitura em funções nomeadas, em vez de espalhar `db.*` pelos
Server Components. Facilita cache e teste.

### Carimbo de identificação nos PDFs
Marcar cada PDF baixado com o e-mail do aluno (`pdf-lib`) para rastrear vazamento.
Complementa a marca d'água do vídeo.

### Observabilidade de webhook
Registrar toda entrega de webhook (recebida, processada, falhada) e alertar em falha.
Webhook silenciosamente quebrado = aluno pagou e não recebeu acesso.

---

## 🟢 Baixa prioridade

- Remover dependências não utilizadas após a limpeza (`qrcode`, `jsqr`, `html2canvas`, `twilio`)
- Avaliar se `framer-motion` é necessário ou se dá para usar CSS puro na landing
- Legendas automáticas nos vídeos (acessibilidade — RNF6)
- Storybook para os componentes da sala de aula

---

*Atualizado em: 2026-08-20*
