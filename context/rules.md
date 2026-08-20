# Regras e Convenções de Desenvolvimento

## NUNCA fazer sem confirmar com o usuário

- Alterar o schema Prisma (`db push --accept-data-loss` apaga dados)
- Mudar o sistema de autenticação (NextAuth)
- Alterar a lógica de cobrança ou o webhook do Stripe
- Remover campos de modelos existentes
- Alterar dados de um certificado já emitido (é imutável)
- Apagar registros de progresso ou matrícula (revogar acesso ≠ apagar histórico)

## SEMPRE fazer

- TypeScript strict, sem `any` desnecessário
- Validar toda entrada com Zod
- Server Actions para mutações internas; API Routes para webhooks e integrações
- Usar `src/lib/prisma.ts` (singleton) — nunca instanciar Prisma direto
- Verificar acesso via `src/lib/acesso.ts` — nunca escrever a checagem na mão
- Usar `date-fns` para datas
- Registrar `LogEvento` em matrícula, pagamento, publicação e emissão de certificado
- Adicionar `@@index` em todo campo de relação (não há FK no banco)
- Rodar `npm run build` antes de abrir PR

## Regras de negócio invioláveis

1. **A matrícula ativa é o único portão de acesso.** Nenhuma rota de conteúdo confia em
   sessão, cookie ou parâmetro de URL — sempre consulta o banco no servidor
2. **Vídeo nunca é servido por URL pública.** Token assinado, expiração ≤ 2 horas, gerado
   no servidor depois de validar a matrícula
3. **Material nunca é servido por URL pública.** Rota autenticada → presigned URL de 60s
4. **Webhook de pagamento é idempotente.** `stripeSessionId` é único; reprocessar não duplica
5. **Certificado emitido é imutável.** Nome, curso, carga horária e data congelados na emissão
6. **Progresso e certificado nunca são apagados** por cancelamento, reembolso ou expiração
7. **Curso arquivado não tira acesso de quem já comprou**
8. **Nenhum dado de cartão passa pela aplicação**
9. **Aula gratuita é a única exceção** ao portão de matrícula — e precisa estar marcada
   explicitamente como `gratuita: true`

## Nomenclatura

| Contexto | Convenção | Exemplo |
|---|---|---|
| Modelos Prisma | PascalCase singular, português | `Matricula`, `ProgressoAula` |
| Tabelas | snake_case plural | `@@map("matriculas")` |
| Rotas | kebab-case, português | `/aluno/certificados` |
| Componentes | PascalCase | `PlayerAula.tsx` |
| Server Actions | verbo + substantivo | `criarMatricula`, `salvarProgresso` |
| Enums | SCREAMING_SNAKE | `StatusMatricula.ATIVA` |

## Checklist de PR

- [ ] `npm run build` passa
- [ ] `npm test` passa
- [ ] Inputs validados com Zod
- [ ] Acesso a conteúdo verificado via `lib/acesso.ts`
- [ ] `@@index` nos campos de relação novos
- [ ] Testado no celular (375px) se mexeu em tela de aluno
- [ ] Arquivo de contexto relevante atualizado

## O que nunca fazer

- Construir em cima do domínio legado do Courtesyfy (`Chave`, `Campanha`, `Loja`, `Resgate`,
  `LoteChave`, `SolicitacaoImpressao`) — é código a ser removido
- Expor `videoUid` ou `arquivoKey` em resposta de API para usuário sem matrícula
- Confiar em verificação de acesso feita no cliente
- Usar `useEffect` para buscar dados que um Server Component resolveria
- Commitar `.env` ou qualquer credencial

---

*Atualizado em: 2026-08-20*
