# Plataforma de Cursos — Dra. Karollyne Morais

Plataforma de cursos online (área de membros) para publicação e venda de conteúdo de
formação médica: aulas em vídeo, slides e PDFs, com acompanhamento de progresso e
certificado de conclusão.

**Status:** em construção — Release 0 (fundação) · **Versão:** 0.1.0

---

## Documentação

| Documento | Conteúdo |
|---|---|
| [`spec.md`](spec.md) | **Especificação completa** — visão, requisitos, modelo de dados, arquitetura, releases, custos, riscos |
| [`CLAUDE.md`](CLAUDE.md) | Guia para o Claude Code — regras críticas e padrões obrigatórios |
| [`context/`](context/) | Visão do sistema, arquitetura, convenções |
| [`planning/`](planning/) | Roadmap, backlog, histórico de versões |
| [`knowledge/`](knowledge/) | Domínio, banco de dados, API |
| [`development/`](development/) | Features em andamento, bugs, melhorias |

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 + shadcn/ui ·
MySQL + Prisma 5 · NextAuth v5 · Stripe · Cloudflare Stream + R2 · Resend · Vercel

---

## Rodando localmente

```bash
npm install
```

Crie um `.env` na raiz com as variáveis listadas em [`spec.md`](spec.md) → Apêndice A.

```bash
npx prisma generate
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção (gera Prisma, sincroniza schema, compila) |
| `npm test` | Suite de testes (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run db:seed` | Popula o banco com a conta administradora |
| `npm run patch` / `end-sprint` / `release` | Versionamento semântico |

⚠️ O script `build` roda `prisma db push --accept-data-loss`. Enquanto o schema estiver
sendo reescrito, **não rode build apontando para um banco com dados que importam**.
Ver [`development/improvements.md`](development/improvements.md).

---

## Origem do código

Este repositório nasceu de um fork do **Courtesyfy** (SaaS de chaves promocionais).
A infraestrutura de autenticação, pagamento, e-mail e design system foi reaproveitada;
todo o domínio de chaves, campanhas e lojas está sendo removido no Release 0.
Detalhes em [`spec.md`](spec.md) → Parte 11.
