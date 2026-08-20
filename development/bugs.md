# Bugs Conhecidos

## Como usar este arquivo

Registre o bug com: contexto, como reproduzir, impacto e status.
Quando corrigir, mova para `planning/releases.md` na versão correspondente.

---

## 🔴 Críticos

Nenhum. O projeto ainda não tem código próprio em produção.

---

## 🟡 Atenção — herdados do projeto base

Não são bugs de execução, mas armadilhas que vão causar problema se não forem tratadas
durante o Release 0.

### `build` roda `prisma db push --accept-data-loss`
**Arquivo:** `package.json`
**Impacto:** todo build de produção sincroniza o schema **descartando dados incompatíveis**.
Enquanto o schema estiver sendo reescrito, um deploy acidental pode apagar dados.
**Ação:** migrar para `prisma migrate deploy` antes de haver dado real de aluno.

### Referências a `courtesyfy.com.br` espalhadas no código
**Arquivos:** `middleware.ts`, `src/lib/email.ts`, `src/app/api/checkout-produto/route.ts`,
`src/app/api/print/layout/route.ts` e componentes de impressão.
**Impacto:** redirect forçado para o domínio errado em produção; e-mails com remetente errado.
**Ação:** remover junto com o domínio legado.

### CSP não libera Cloudflare
**Arquivo:** `next.config.ts`
**Impacto:** o player do Stream e os downloads do R2 serão bloqueados pelo Content Security
Policy assim que forem integrados.
**Ação:** adicionar `cloudflarestream.com` em `frame-src`/`media-src`/`connect-src` e o
domínio do R2 em `connect-src`.

---

## 🟢 Resolvidos

Nenhum ainda.

---

*Atualizado em: 2026-08-20*
