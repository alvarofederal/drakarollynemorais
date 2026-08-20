# Features em Desenvolvimento

## Como usar este arquivo

Liste aqui o que está **ativamente em desenvolvimento**.
Quando concluir, mova para `planning/releases.md`.

---

## 🔴 Em andamento — Release 0 (fundação)

### Limpeza do legado Courtesyfy
**Prioridade:** crítica
**Contexto:** o repositório é um fork do Courtesyfy. A infraestrutura fica; o domínio de
chaves promocionais sai inteiro. Enquanto não sair, o código legado confunde a navegação e
os arquivos de contexto.

**Progresso:**
- [x] Remover `.md` herdados de outros projetos (`TODO.md`, `context_principal.md`, `ia-contexto-*.md`)
- [x] Reescrever `spec.md` para o novo produto
- [x] Reescrever `CLAUDE.md` e os arquivos de `context/`, `planning/`, `knowledge/`
- [ ] Reescrever `prisma/schema.prisma`
- [ ] Remover rotas do domínio antigo (`/dashboard/campanhas`, `/chaves`, `/resgates`, `/validar`, `/totem`, `/impressao`, `/layout`, `/lojas`, `/clientes`, `/c/[codigo]`, `/r/[lojaId]`, `/resgatar`, `/print`, `/onboarding/loja`)
- [ ] Remover API routes antigas (`/api/chaves`, `/api/lotes`, `/api/print`, `/api/checkout-produto`, `/api/cron/expirar-chaves`)
- [ ] Remover dependências: `qrcode`, `qrcode.react`, `jsqr`, `html2canvas`, avaliar `twilio`
- [ ] Substituir a landing page atual (1.098 linhas do Courtesyfy)
- [ ] Limpar referências a `courtesyfy.com.br` no código

### Definição de marca e infraestrutura
**Prioridade:** crítica — bloqueia o R0
- [ ] Nome, domínio e identidade visual confirmados com a Dra.
- [ ] Conta Cloudflare criada, Stream habilitado, bucket R2 privado criado
- [ ] Chave de assinatura do Stream gerada
- [ ] Provedor e plano do MySQL confirmados
- [ ] Conta Stripe verificada (PIX e parcelamento)

---

## 🟡 Próximo — Release 1 (núcleo do conteúdo)

Ver `planning/roadmap.md` → R1. Não iniciar antes de fechar o R0.

---

## ⚪ Bloqueado

| Item | Bloqueado por |
|---|---|
| Landing page | Logo, paleta e fotos profissionais |
| Página de vendas | Preço e política de acesso do primeiro curso |
| Certificado | Definição de carga horária, assinatura e se leva CRM/RQE |
| Checkout com PIX/parcelamento | Verificação da conta Stripe BR |

---

*Atualizado em: 2026-08-20*
