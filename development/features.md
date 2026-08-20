# Features em Desenvolvimento

## Como usar este arquivo

Liste aqui o que está **ativamente em desenvolvimento**.
Quando concluir, mova para `planning/releases.md`.

---

## ✅ Release 0 — concluído (2026-08-20)

- [x] `.md` herdados de outros projetos removidos
- [x] `spec.md`, `CLAUDE.md` e arquivos de contexto reescritos
- [x] Landing page nova, no lugar das 1.098 linhas do Courtesyfy
- [x] `prisma/schema.prisma` reescrito — 21 tabelas criadas no banco
- [x] Domínio Courtesyfy removido do código (painel, rotas públicas, APIs, testes)
- [x] Autenticação com sessão JWT, dois papéis (`ADMIN` / `ALUNO`)
- [x] `/login` e `/register` refeitos, escuros por padrão
- [x] Seletor de tema claro/escuro
- [x] `prisma/seed.ts` para criar a conta ADMIN
- [x] Telas mínimas `/aluno` e `/admin` para o fluxo ficar verificável

---

## ✅ Release 1, parte 1 — painel de conteúdo (2026-08-20)

- [x] `src/lib/acesso.ts` — ponto único de verificação de acesso
- [x] `/admin` com navegação própria
- [x] CRUD de curso, módulo e aula, com reordenação e publicação individual
- [x] `/admin/alunos`
- [x] Regras de publicação e exclusão aplicadas no servidor

---

## 🔴 Bloqueando o resto do Release 1

### Conta ADMIN está com e-mail de exemplo
O seed rodou com o valor literal do exemplo: `email-real-dela@dominio.com.br`.
A conta funciona, mas o e-mail é fictício — precisa virar o e-mail real dela.

### Cloudflare — Stream pronto, R2 pendente
- [x] Conta criada, Stream habilitado e pago
- [x] Chave de assinatura gerada (`npm run stream:chave`)
- [x] Variáveis do Stream no `.env`
- [ ] **Criar bucket R2 privado** `karollyne-materiais`
- [ ] **Gerar token do R2** e preencher `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`

Sem o R2, os PDFs e slides das aulas não têm onde ficar.

### Webhook do Stream (só em produção)
Em desenvolvimento o painel consulta o status do vídeo. Quando subir para
produção, configurar o webhook do Stream apontando para `/api/webhook/stream`
para não depender de consulta.

---

## 🟡 Próximo — Release 1 (núcleo do conteúdo)

- [ ] `src/lib/stream.ts` — upload direto e assinatura de token
- [ ] `src/lib/r2.ts` — presigned URLs dos materiais
- [ ] `src/lib/acesso.ts` — ponto único de verificação de matrícula
- [ ] Painel: CRUD de curso, módulo e aula com reordenação
- [ ] Upload de vídeo e de material pelo navegador
- [ ] Sala de aula: player, progresso, materiais, marca d'água
- [ ] Concessão manual de matrícula

Ver `planning/roadmap.md` → R1.

---

## ⚪ Pendências que dependem da Dra.

| Item | Trava o quê |
|---|---|
| Logo, paleta e fotos profissionais | Identidade visual da landing (hoje é paleta provisória) |
| Bio, especialidade, CRM e RQE | Seção "Sobre" da landing |
| WhatsApp, Instagram, e-mail, CNPJ | Rodapé e canal de contato |
| Nome e domínio definitivos | Deploy em produção |
| Tema e preço do primeiro curso | Página de vendas (R2) |
| Acesso vitalício ou por prazo | Regra de expiração de matrícula |
| Carga horária e assinatura do certificado | Emissão do certificado (R3) |
| Depoimentos de alunos com autorização | Prova social da landing |

---

*Atualizado em: 2026-08-20*
