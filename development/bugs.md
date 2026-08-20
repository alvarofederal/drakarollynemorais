# Bugs Conhecidos

## Como usar este arquivo

Registre o bug com: contexto, como reproduzir, impacto e status.
Quando corrigir, mova para a seção "Resolvidos" e registre em `planning/releases.md`.

---

## 🔴 Críticos

Nenhum.

---

## 🟡 Atenção

### `build` sincroniza o schema com `prisma db push`
**Arquivo:** `package.json`
**Situação:** o `--accept-data-loss` foi removido, então hoje um build que exigiria
descartar dados **falha** em vez de apagar em silêncio. Isso é um remendo, não a solução.
**Impacto:** enquanto o projeto não usar migrations, mudanças destrutivas no schema
travam o deploy — e mudanças não destrutivas passam sem histórico versionado.
**Ação:** adotar `prisma migrate` (gerar a migration inicial a partir do schema atual e
trocar o build para `prisma migrate deploy`) **antes** de existir aluno pagante no banco.

*(o item da CSP saiu daqui — foi corrigido, ver Resolvidos)*

### Verificação de e-mail não bloqueia o acesso
**Decisão consciente, registrada aqui para não virar surpresa.**
O cadastro cria a conta e já entra na plataforma, sem confirmar o e-mail. Isso foi pedido
("facilitar a entrada") e é o certo para conversão, mas significa que alguém pode se
cadastrar com um e-mail que não é seu.
**Mitigação atual:** a compra passa pela Stripe, que valida o e-mail do comprador.
**Ação futura:** exigir e-mail verificado antes de emitir certificado.

---

## 🟢 Resolvidos

### Upload de vídeo falhava com "Conexão interrompida durante o envio" — ✅ 2026-08-20
**Sintoma:** o `POST /api/upload/video` respondia 200, o Cloudflare devolvia a URL de
upload, mas o envio do arquivo morria no `xhr.onerror` com status 0.
**Causa:** não era CORS nem rede — era a **nossa própria CSP**. O `connect-src` só
liberava Stripe, Cloudinary e Resend, então o navegador bloqueava a conexão com
`upload.cloudflarestream.com`. O erro só aparecia no console, como
`violates the following Content Security Policy directive`.
**Correção:** `next.config.ts` — `connect-src`, `frame-src`, `media-src` e `img-src`
agora liberam `*.cloudflarestream.com`, mais `*.r2.cloudflarestorage.com` para os
materiais. Exige reiniciar o servidor, porque `next.config.ts` não recarrega sozinho.
**Lição:** este bug estava previsto neste arquivo desde o primeiro dia e foi ignorado
na hora de construir o upload. Item de "atenção" também precisa ser lido.

### Erro de codificação travava o painel por 5 minutos — ✅ 2026-08-20
Quando o Cloudflare não conseguia processar o arquivo, marcava `status.state = "error"`,
mas a consulta do painel só olhava `readyToStream`. Resultado: 100 tentativas de 3s até
desistir com uma mensagem genérica. Agora o estado de erro é detectado na hora (~10s),
o vídeo quebrado é excluído do Cloudflare e o motivo aparece traduzido para português.

### Banco de dados sem tabelas — ✅ 2026-08-20
O `DATABASE_URL` apontava para `u937845481_plat_curso_db`, que estava com **0 tabelas**.
Toda requisição autenticada estourava `The table 'sessions' does not exist`.
Resolvido criando as 21 tabelas do novo schema com `prisma db push`. Como o banco estava
vazio, não houve risco de perda de dado.

### E-mail com espaço era recusado no cadastro — ✅ 2026-08-20
No `registerSchema`, o `.email()` vinha antes do `.trim()`. Como o Zod aplica as checagens
na ordem em que são declaradas, colar um e-mail com espaço em volta reprovava a validação
antes de a limpeza acontecer. Ordem corrigida para `.trim().toLowerCase().email()`.
Pego pelo teste em `tests/unit/validators-auth.test.ts`.

### Referências a `courtesyfy.com.br` no código — ✅ 2026-08-20
Removidas junto com o domínio legado. `middleware.ts` e `src/lib/email.ts` reescritos.

---

*Atualizado em: 2026-08-20*
