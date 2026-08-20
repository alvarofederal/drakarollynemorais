# Roadmap do Produto

## Visão de longo prazo

Ser a casa digital da Dra. Karollyne Morais: onde o conteúdo dela vive, onde os alunos dela
compram e estudam, e onde a base de alunos e os dados ficam sob controle dela — sem taxa de
marketplace e sem concorrente na mesma tela.

Detalhamento completo em [`spec.md`](../spec.md) → Parte 12.

---

## R0 — Fundação (limpeza) · ~1 semana · 🔵 em andamento

- [ ] Confirmar nome, domínio e identidade visual
- [ ] Criar conta Cloudflare (Stream + bucket R2 privado) e gerar credenciais
- [ ] Reescrever `prisma/schema.prisma` com o modelo da spec
- [ ] Remover rotas, componentes, modelos e dependências do domínio Courtesyfy
- [ ] Seed com a conta `ADMIN` da Dra.
- [ ] Ajustar `middleware.ts`, `next.config.ts` (CSP) e `lib/email.ts`
- [ ] Configurar domínio e variáveis de ambiente na Vercel
- [ ] `npm run build` limpo e deploy inicial

**Entrega:** projeto limpo, buildando, autenticando e no ar.

---

## R1 — Núcleo do conteúdo · ~2 semanas · ⚪ planejado

**É o marco mais importante do projeto.**

- [ ] Painel: CRUD de curso, módulo e aula com reordenação
- [ ] Upload de vídeo direto do browser para o Cloudflare Stream
- [ ] Webhook do Stream (duração e status `ready`)
- [ ] Upload de materiais (PDF/slide) para o R2
- [ ] `lib/acesso.ts` — ponto único de verificação de matrícula
- [ ] Sala de aula: sidebar, player com token assinado, materiais
- [ ] Marca d'água dinâmica com dados do aluno
- [ ] Progresso por aula e percentual do curso
- [ ] Concessão manual de matrícula

**Entrega:** a Dra. sobe um curso inteiro e um aluno de teste assiste do começo ao fim.

---

## R2 — Venda · ~1,5 semana · ⚪ planejado

- [ ] Catálogo `/cursos`
- [ ] Página de vendas `/cursos/[slug]` com ementa e aula de amostra
- [ ] Checkout Stripe + página de sucesso
- [ ] Webhook idempotente → pedido + matrícula automática
- [ ] Reembolso revoga acesso
- [ ] E-mails transacionais (acesso liberado)
- [ ] Painel de pedidos

**Entrega:** dá para vender.

---

## R3 — Landing e certificado · ~1,5 semana · ⚪ planejado

- [ ] Landing page completa (referência: lp.cademi.com.br, adaptada)
- [ ] Geração do certificado em PDF
- [ ] Página pública de validação `/certificados/[codigo]`
- [ ] Depoimentos e FAQ gerenciáveis
- [ ] SEO, Open Graph e dados estruturados `Course`

**Entrega:** dá para divulgar.

---

## R4 — Lançamento · ~1 semana · ⚪ planejado

- [ ] Termos de uso e política de privacidade
- [ ] Analytics
- [ ] Teste ponta a ponta do fluxo de compra
- [ ] Carga do conteúdo real
- [ ] Revisão de segurança e de custo do Stream
- [ ] Revisão dos textos quanto à publicidade médica (CFM)

**Entrega:** v1.0 no ar.

---

## v1.1 e além

- Comentários e dúvidas por aula, com resposta da Dra.
- Quizzes e provas
- Cupons de desconto
- Drip content (liberação programada de módulos)
- Anotações do aluno com marcação de tempo
- Retenção por aula (onde os alunos param)
- Assinatura recorrente com acesso a todos os cursos
- Limite de sessões simultâneas (antipirataria)
- PWA com download offline
- Notificação por WhatsApp
- Emissão automática de nota fiscal

---

*Atualizado em: 2026-08-20*
