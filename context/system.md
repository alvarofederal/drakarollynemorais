# Visão Geral do Sistema

> Resumo executivo. A fonte de verdade completa é [`spec.md`](../spec.md).

## O que é

Plataforma de cursos online (área de membros) da **Dra. Karollyne Morais**.
Ela publica cursos com aulas em vídeo, slides e PDFs; alunos compram pelo site, assistem,
acompanham o progresso e recebem certificado de conclusão.

**Modelo de negócio:** venda direta de curso (compra única, via Stripe Checkout)
**Público-alvo:** médicos, residentes e estudantes de medicina
**Status:** em construção — Release 0 (fundação)
**Versão:** 0.1.0

## Conceito central

O sistema gira em torno da **matrícula** — o vínculo entre um aluno e um curso.
É a matrícula, e só ela, que dá acesso ao conteúdo.

```
Visitante → compra → Matrícula ATIVA → assiste → progresso 100% → Certificado
                          ↓
              EXPIRADA / CANCELADA / REEMBOLSADA  (acesso revogado)
```

Hierarquia de conteúdo:

```
Curso → Módulo → Aula → Material (slide, PDF, planilha)
```

## Atores

| Papel | Quem é | Pode |
|---|---|---|
| `ADMIN` | Dra. Karollyne | Tudo: conteúdo, alunos, matrículas, pedidos, configurações |
| `EQUIPE` | Editor/secretária | **Não implementado.** Fica para quando ela precisar delegar |
| `ALUNO` | Quem comprou ou recebeu cortesia | Cursos com matrícula ativa |
| *(visitante)* | Não autenticado | Landing, catálogo, aulas gratuitas, validação de certificado |

**Professor convidado não é usuário.** É metadado do curso (nome, foto, titulação, CRM).
A Dra. publica o conteúdo por ele.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Estilo | Tailwind 4 + shadcn/ui + dark mode |
| Banco | MySQL + Prisma 5 (`relationMode = "prisma"`) |
| Auth | NextAuth v5 (Credentials + Google + GitHub) |
| Pagamento | Stripe Checkout + Webhook |
| Vídeo | Cloudflare Stream (URL assinada) |
| Arquivos privados | Cloudflare R2 |
| Imagens públicas | Cloudinary |
| E-mail | Resend + React Email |
| Rate limit | Upstash Redis |
| PDF | jsPDF (certificados) |
| Testes | Vitest |
| Deploy | Vercel |

## Origem do código

Este repositório é um fork do **Courtesyfy** (SaaS de chaves promocionais). A infraestrutura
de autenticação, pagamento, e-mail e design system foi reaproveitada; todo o domínio de
chaves, campanhas e lojas está sendo removido. Ver `spec.md` → Parte 11.

## Integrações externas

| Serviço | Uso | Situação |
|---|---|---|
| Cloudflare Stream | Vídeo com token assinado | a integrar |
| Cloudflare R2 | Bucket privado de materiais | a integrar |
| Stripe | Checkout e webhook | base pronta, adaptar |
| Cloudinary | Capas e avatares | pronto |
| Resend | E-mails transacionais | pronto |
| Upstash | Rate limit | pronto |

---

*Atualizado em: 2026-08-20*
