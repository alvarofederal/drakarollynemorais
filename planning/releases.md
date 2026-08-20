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

## v0.1.1 — 2026-08-20 — Landing page

Primeira tela própria do projeto. A landing do Courtesyfy (1.098 linhas) foi removida.

**Adicionado**
- `src/config/landing.ts` — conteúdo e marca centralizados num arquivo
- Tokens de marca `--color-km-*` em `globals.css` (paleta provisória, light-first)
- Tipografia da marca: Spectral (display) + Geist (corpo)
- `src/app/_components/landing/` — cabeçalho, hero, seções, FAQ e rodapé
- Hero com prévia da sala de aula: player, marca d'água, trilha de aulas e materiais

**Alterado**
- `src/app/layout.tsx` — metadados do novo produto, `lang="pt-BR"`, tema padrão claro,
  variáveis de fonte movidas para o `<html>` (o `@theme` do Tailwind emite
  `--font-display` em `:root` e precisa enxergar `--font-spectral` no mesmo escopo)
- `src/components/theme-toggle.tsx` — chave `cfy-theme` → `km-theme`, padrão claro

**Removido**
- `src/app/page.tsx` do Courtesyfy e seus componentes (`splash-screen`, `lightning-canvas`)
- Imagens de outros projetos em `public/` (`doctor-hero`, `foto1`, `logo-odonto`) e os
  SVGs padrão do create-next-app

**Verificado**
- `npx tsc --noEmit` limpo
- Sem overflow horizontal em 375px; menu mobile e accordion do FAQ funcionando

---

## v0.2.0 — 2026-08-20 — Release 0 concluído: banco, autenticação e limpeza

**Banco de dados — 21 tabelas criadas**
- `prisma/schema.prisma` reescrito para o domínio de cursos
- Autenticação: `User` (com `cpf`, `telefone`), `Account`, `Session`, `AuthToken`, `LoginAttempt`
- Conteúdo: `Professor`, `Categoria`, `Curso`, `Modulo`, `Aula`, `Material`
- Acesso: `Matricula`, `ProgressoAula`, `Certificado`
- Comércio: `Pedido`, `Cupom`
- Apoio: `Depoimento`, `Faq`, `ConfigPlataforma`, `LogEvento`
- Dois papéis: `ADMIN` (a Dra.) e `ALUNO`

**Autenticação — sessão JWT**
- `strategy: "jwt"` no lugar de sessão em banco: uma consulta a menos por requisição
- Papel e id do usuário viajam no token; revalidados contra o banco a cada 5 minutos,
  para que desativar um aluno ou mudar um papel tenha efeito sem esperar o token expirar
- Credenciais com bcrypt custo 12 e resposta de tempo constante quando a conta não existe
- Login com Google mantido
- Política de senha alinhada ao NIST: mínimo 8, uma letra e um número — sem exigir
  símbolo e maiúscula, que empurram o usuário para senhas piores
- Cadastro público sempre nasce `ALUNO`; papel nunca vem do cliente
- Freio de força bruta no login: 10 tentativas por e-mail e 30 por IP a cada 15 min
- Limite de 5 cadastros por IP por hora
- Toda tentativa de login vai para `LoginAttempt` (e-mail, IP, sucesso/falha)
- `LogEvento` registra `CADASTRO` e `LOGIN`

**CSS**
- `globals.css` caiu de 1.239 para 231 linhas — saiu todo o CSS do painel deletado,
  incluindo `.dark h2:not(.no-dark) { color: #fff }`, que sobrescrevia silenciosamente
  a cor de **todos** os títulos do site no tema escuro

**Telas**
- `/login` e `/register` refeitos, escuros por padrão, com seletor de tema
- `/apos-login` — despachante que manda ADMIN para `/admin` e ALUNO para `/aluno`
- `/aluno` e `/admin` — telas mínimas com dados reais da sessão e métricas do banco
- `prisma/seed.ts` — cria a conta ADMIN a partir de `ADMIN_EMAIL`, com senha via
  `ADMIN_PASSWORD` ou gerada e impressa uma única vez

**Tema**
- Tokens `--km-*` agora respondem a claro/escuro; **escuro é o padrão**
- Seletor de tema no cabeçalho da landing, do login e das áreas internas

**Removido — domínio Courtesyfy**
- `src/app/(panel)` inteiro, `(public)`, `_actions`, `c/`, `r/`, `resgatar/`, `print/`,
  `onboarding/`, `auth/`
- APIs: `chaves`, `lotes`, `print`, `checkout-produto`, `criar-checkout`, `cron`,
  `notifications`, `webhook`
- `src/lib/api-key.ts`, template de e-mail de chave ativada, testes do domínio antigo

**Verificado**
- `npx tsc --noEmit` limpo
- 22 testes passando (3 arquivos)
- Fluxo real conferido no navegador: senha fraca → 400, cadastro → 201, e-mail duplicado
  → 409, login → sessão com papel correto, senha errada → sem sessão, `/admin` como ALUNO
  → redireciona para `/aluno`, `/admin` como ADMIN → renderiza o painel
- Seletor de tema alterna e persiste nos dois sentidos

---

## v0.3.0 — 2026-08-20 — Painel de conteúdo (R1, parte 1)

A Dra. já consegue montar um curso inteiro sozinha. Falta só o upload de vídeo,
que depende da conta Cloudflare.

**Novo**
- `src/lib/acesso.ts` — ponto único de verificação: `exigirAdmin`, `exigirSessao`,
  `verificarAcesso`, `exigirAcesso`. Nenhuma tela escreve a própria checagem
- `src/lib/slug.ts` — slug sem acento, com unicidade garantida
- `src/lib/formato.ts` — preço em centavos, duração e data em pt-BR
- `/admin` com moldura própria e navegação (Visão geral · Cursos · Alunos)
- `/admin/cursos` — lista com status, nº de aulas, carga, preço e matriculados
- `/admin/cursos/novo` e `/admin/cursos/[id]` — criação e edição
- Editor em abas: **Conteúdo** (módulos e aulas) e **Dados do curso**
- Módulos e aulas: criar, excluir, reordenar e publicar individualmente
- `/admin/alunos` — lista de alunos com matrículas e último acesso

**Regras aplicadas no servidor**
- Curso nasce `RASCUNHO`; publicar é ação explícita
- Não publica curso sem pelo menos uma aula publicada
- Não publica aula de vídeo sem vídeo pronto
- Não exclui curso com matrícula — manda arquivar, para não apagar histórico
- Não exclui aula que algum aluno já assistiu
- Slug do curso só muda quando o título muda, para não quebrar link divulgado
- Cascata manual na exclusão (não há foreign key com `relationMode = "prisma"`)
- `LogEvento` registra `CURSO_PUBLICADO` e `AULA_PUBLICADA`

**Decisão**
- Reordenação por botões ↑ ↓ em vez de arrastar. A spec pedia arrastar, mas isso
  exigiria uma biblioteca de drag-and-drop só para isso. Fica para depois do MVP.

**Verificado no navegador, ponta a ponta**
- Criar curso → redireciona para o editor · criar módulo · criar aula
- Publicar curso sem aula → recusado com a mensagem certa
- Publicar aula de vídeo sem vídeo → recusado com a mensagem certa
- Criar aula de texto → publicar → publicar o curso → sucesso
- Reordenar aulas → ordem persistida no banco
- Slug gerado: "Emergências Cardiológicas na Prática" → `emergencias-cardiologicas-na-pratica`
- `npx tsc --noEmit` limpo · 30 testes passando (4 arquivos)

---

## v0.4.0 — 2026-08-20 — Upload de vídeo (Cloudflare Stream)

Conta Cloudflare contratada e integrada. A Dra. já sobe vídeo pelo painel.

**Novo**
- `src/lib/stream.ts` — camada única do Cloudflare Stream: criar upload direto,
  consultar vídeo, excluir e **assinar token de reprodução** (RS256 com o JWK)
- `POST /api/upload/video` — devolve URL de upload de uso único (só `ADMIN`)
- `sincronizarVideoDaAula` — consulta o estado da codificação e grava
  `videoPronto` e `duracaoSegundos`
- `removerVideoDaAula` — apaga no Cloudflare e no banco, e despublica a aula
- `UploadVideo` — botão de envio na linha da aula, com barra de progresso real
- `scripts/criar-chave-stream.ts` (`npm run stream:chave`) — cria a chave de
  assinatura e grava no `.env` **sem imprimir o segredo no terminal**

**Decisões**
- Todo vídeo nasce com `requireSignedURLs: true`. Sem isso o link seria público
- Token de reprodução vale **2 horas**, com 30s de folga de relógio
- O arquivo vai do navegador **direto** ao Cloudflare — contorna o limite de
  corpo de requisição da Vercel e não consome nossa banda
- O `videoUid` é gravado na aula **antes** do envio começar: se o upload falhar
  no meio, sobra um vídeo pendente no Cloudflare, não um registro órfão
- Ao substituir um vídeo, o anterior é excluído — não se paga armazenamento por lixo
- Em dev o painel consulta o status em vez de esperar webhook, que não alcança
  `localhost`. Em produção o webhook faz esse trabalho

**Verificado contra a API real do Cloudflare**
- Criar upload direto · consultar vídeo · assinar token · excluir vídeo
- Token: `alg RS256`, `kid` presente, `sub` == uid, expira em ~120 min
- `POST /api/upload/video` autenticado → 200 com `uploadURL` e `uid` persistido
- Sem sessão → redireciona para o login (acesso negado)
- Remover vídeo pela UI → botão volta a "Enviar vídeo", `videoUid` vira nulo e
  o vídeo some da conta Cloudflare (0 órfãos)
- `npx tsc --noEmit` limpo · 30 testes passando

**Não exercitado:** a transferência do arquivo em si (não há ffmpeg na máquina
para gerar um vídeo de teste). O `XMLHttpRequest` que envia os bytes é o único
trecho ainda não visto rodando.

---

## v0.5.0 — 2026-08-20 — O curso chega ao aluno

Fecha o ciclo: publicar → aparecer no catálogo → liberar acesso → o aluno vê.

**Corrigido**
- **O catálogo da landing nunca lia o banco.** Vinha de um array fixo em
  `config/landing.ts`, que estava vazio — então curso publicado não aparecia.
  Agora vem de `listarCursosDoCatalogo()`, filtrando por `status = PUBLICADO`
- **Não havia como matricular ninguém.** Sem checkout e sem liberação manual,
  nenhum aluno conseguia acesso a nada

**Novo**
- `src/lib/cursos.ts` — consultas de leitura num lugar só: catálogo, página
  pública e cursos do aluno. Decide num ponto o que é visível publicamente
- `/cursos/[slug]` — página pública do curso: ementa completa com cadeado nas
  aulas bloqueadas, aula de amostra marcada, preço, professor e FAQ
- `/admin/alunos/[id]` — ficha do aluno com matrículas, certificados e dados
- Liberação manual de acesso (origem `CORTESIA`), com revogação
- Ativar/desativar a conta do aluno
- `/aluno` agora lista os cursos matriculados com barra de progresso

**Regras**
- `expiraEm` é calculado a partir do `tipoAcesso` do curso, nunca digitado
- Revogar matrícula **não** apaga progresso nem certificado — só o acesso
- Matrícula já existente é reativada em vez de duplicada
- Curso `RASCUNHO` nunca é público; `ARQUIVADO` continua acessível por link direto

**Layout**
- Removidos os `max-w-6xl` e `max-w-5xl` dos contêineres de página, a pedido.
  As restrições de componente (`max-w-md` no login, `max-w-2xl` nos formulários)
  foram mantidas — sem elas, formulário e texto corrido ficam ilegíveis em
  monitor largo

**Verificado no navegador**
- Curso publicado aparece no catálogo com preço, carga e nº de aulas
- Página do curso: visitante vê cadeado; matriculado vê "Você já tem acesso"
- Liberar acesso pela ficha do aluno → matrícula `ativa · cortesia`
- `/aluno` do matriculado lista o curso com barra de progresso
- `npx tsc --noEmit` limpo · 30 testes passando · sem erro de console

---

## v0.6.0 — 2026-08-20 — Sala de aula e conserto da navegação

O aluno finalmente assiste. E os links passam a levar a algum lugar.

**Corrigido — a navegação estava quebrada**
- **O cabeçalho mostrava "Entrar" para quem já estava logado.** Ele era estático e não
  consultava a sessão; quem entrava achava que tinha caído fora. Agora usa `useSession`
  e mostra "Minha área" (ou "Painel", para a ADMIN)
- **Os links do menu eram âncoras relativas** (`#sobre`, `#faq`). Fora da landing não
  existiam e não faziam nada. Viraram absolutas (`/#sobre`)
- **"Começar" e "Ir para o curso" levavam à página de vendas**, não para o conteúdo
- **"Solicitar acesso" ia para `/aluno`** e não solicitava nada. Agora abre o WhatsApp
  (quando configurado) ou some, em vez de fingir que faz algo
- `/termos-de-uso` e `/politica-de-privacidade` davam 404 — criadas como páginas
  honestas de "em elaboração", sem texto jurídico inventado

**Novo — a sala de aula**
- `/aluno/curso/[slug]` — decide onde retomar e redireciona para a aula certa
- `/aluno/curso/[slug]/[aulaSlug]` — player, trilha lateral, anterior/próxima
- Player Cloudflare com **token assinado gerado no servidor**, depois da matrícula
  ter sido conferida
- Marca d'água com nome e e-mail de quem assiste, reposicionada a cada 25s
- "Marcar como concluída" recalcula o percentual a partir da contagem de aulas
  publicadas — não de um contador incremental, que sairia do lugar
- Aulas bloqueadas aparecem com cadeado e **não são links**

**Novo — pré-visualização da ADMIN**
- "Ver como aluno" no editor do curso abre a sala de aula real
- Faixa de aviso deixando claro que é pré-visualização e que o progresso não conta
- A ADMIN entra sem matrícula; sem matrícula, não há progresso a registrar

**Verificado**
- Manifesto HLS assinado responde **200 com `#EXTM3U`** — o vídeo é reproduzível
- **Token adulterado → 401** — a proteção do conteúdo funciona
- Marcar concluída: 0% → 100%, botão vira "Concluída"
- Pré-visualização: faixa presente, player funcionando, sem botão de progresso
- Todas as 13 rotas respondem: públicas 200, protegidas 307 para o login. Nenhum 404
- Nenhuma âncora relativa restante no código
- `npx tsc --noEmit` limpo · 30 testes passando

---

## v0.6.1 — 2026-08-20 — Deploy na Vercel

**No ar:** https://plataformadrakarollynemorais.vercel.app

**Preparação para produção**
- **Indexação por buscadores virou opt-in.** Só liga com
  `NEXT_PUBLIC_PERMITIR_INDEXACAO=true`. Enquanto a landing tiver texto de
  preenchimento sobre uma médica real, ela não pode entrar no Google — conteúdo
  indexado é difícil de tirar do índice depois
- `src/app/robots.ts` — `Disallow: /` enquanto a indexação estiver desligada
- `metadataBase` passa a usar `VERCEL_URL` quando não há domínio próprio; antes
  gerava links canônicos apontando para um domínio que não existe
- `scripts/vercel-env.mjs` (`npm run vercel:env`) — envia o `.env` local para a
  Vercel pelo CLI do próprio usuário, com os valores indo por stdin

**Corrigido**
- **A landing era gerada estática no build.** Como o catálogo agora lê o banco,
  um curso publicado só apareceria no deploy seguinte. Passou a ISR de 5 min, e
  publicar/despublicar chama `revalidatePath("/")` para refletir na hora
- **`/robots.txt` respondia 307 em produção.** O middleware exigia sessão para
  qualquer caminho fora da lista pública, e o `matcher` não excluía arquivos de
  raiz. Adicionada lista explícita: robots, sitemap, manifest, ícones

**Verificado em produção**
- Rotas públicas 200; `/aluno` e `/admin` 307 para o login
- Catálogo mostra "Osteometabolica" — leitura do banco funcionando na Vercel
- Página do curso monta a ementa com "Aula 01 · 1h 44min"
- `<meta name="robots" content="noindex, nofollow">` presente
- `robots.txt` servindo `Disallow: /`

**Pendente:** as variáveis do Cloudflare Stream ainda não estão na Vercel — o
vídeo não vai tocar em produção até `npm run vercel:env` rodar.

---

*Próxima versão prevista: v0.7.0 — materiais em R2 e certificado*
