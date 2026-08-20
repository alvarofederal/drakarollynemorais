# Histórico de Versões

Versionamento semântico. `npm run patch` (correção) · `npm run end-sprint` (minor) ·
`npm run release` (major).

---

## v0.1.0 — 2026-08-20 — Abertura do projeto

Primeira sessão. Descoberta e definição do produto.

**Decisões estruturais travadas**
- Plataforma exclusiva da Dra. Karollyne — sem multi-tenant; professores convidados são
  metadado do curso, não usuários
- Venda direta com Stripe Checkout (compra por curso)
- Cloudflare Stream para vídeo, Cloudflare R2 para materiais
- MVP: área de membros + landing + painel de conteúdo + certificado

**Documentação**
- `spec.md` reescrita: especificação completa do produto (15 partes + apêndices)
- `CLAUDE.md` reescrito para o novo projeto
- `context/system.md`, `context/architecture.md`, `context/rules.md` reescritos
- `knowledge/domain.md`, `knowledge/database.md`, `knowledge/api.md` reescritos
- `planning/roadmap.md`, `planning/backlog.md` reescritos

**Limpeza**
- Removidos `.md` herdados de outros projetos: `TODO.md`,
  `planning/context_principal.md`, `planning/ia-contexto-funcionalidades.md`,
  `planning/ia-contexto-instalacao.md`
- `spec.md` do projeto "Achei no Jardim Botânico" substituída (método de trabalho preservado)

**Ainda não tocado:** código-fonte e schema Prisma seguem sendo os do Courtesyfy.

---

*Próxima versão prevista: v0.2.0 — conclusão do Release 0 (fundação limpa)*
