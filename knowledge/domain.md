# Conhecimento de Domínio

## Vocabulário

| Termo no sistema | Significado no mundo real |
|---|---|
| `Curso` | Produto vendável. Tem preço, capa, descrição, autor e trilha de módulos |
| `Modulo` | Agrupamento ordenado de aulas dentro de um curso |
| `Aula` | Unidade de consumo: um vídeo (ou texto/PDF) mais materiais anexos |
| `Material` | Arquivo de apoio: slide, PDF, planilha, link |
| `Matricula` | Vínculo entre aluno e curso. **É o que dá acesso** |
| `ProgressoAula` | Quanto o aluno assistiu de cada aula |
| `Certificado` | PDF de conclusão com código de validação pública |
| `Professor` | Autor exibido do curso. Metadado, não é usuário |
| `Pedido` | Tentativa de compra e seu status no Stripe |
| `Cupom` | Desconto aplicável no checkout (v1.1) |
| Cortesia | Matrícula criada manualmente pela Dra., sem pagamento |
| Aula gratuita | Aula marcada como amostra, acessível sem matrícula |

## Estados e transições

### Curso

```
RASCUNHO ──publicar──> PUBLICADO ──arquivar──> ARQUIVADO
              ↑                                     │
              └──────────── republicar ─────────────┘
```

- `RASCUNHO` — não aparece no catálogo, não pode ser comprado
- `PUBLICADO` — visível e vendável
- `ARQUIVADO` — some do catálogo, **mas quem já tem matrícula continua acessando**

### Matrícula

```
                  ┌──prazo vencido──> EXPIRADA
ATIVA ────────────┼──reembolso──────> REEMBOLSADA
                  └──cancelamento───> CANCELADA
```

Só `ATIVA` (e dentro do prazo, se houver) dá acesso.
Sair de `ATIVA` revoga o acesso, mas **preserva progresso e certificado**.

### Pedido

```
PENDENTE ──pagamento aprovado──> PAGO ──reembolso──> REEMBOLSADO
    └──falha ou expiração──> FALHOU
```

## Regras de negócio

### Acesso

1. Conteúdo só é entregue com matrícula `ATIVA` e não expirada
2. Aula marcada como `gratuita` é a única exceção
3. Estar logado não dá acesso a nada — a matrícula dá
4. Curso arquivado mantém o acesso de quem já comprou

### Conclusão e certificado

5. Aula é concluída automaticamente ao atingir 90% do vídeo, ou manualmente pelo aluno
6. O percentual da matrícula é recalculado a cada aula concluída
7. O certificado é emitido ao atingir `curso.percentualParaCertificado` (padrão 100%)
8. Os dados do certificado são congelados na emissão — mudar o curso depois não altera
   certificados antigos
9. O código do certificado é único e validável publicamente sem login

### Pagamento

10. O webhook do Stripe é a única fonte de verdade sobre pagamento aprovado
11. Reprocessar o mesmo evento nunca duplica pedido ou matrícula
12. Reembolso no Stripe revoga o acesso automaticamente
13. A Dra. pode conceder matrícula manualmente (origem `CORTESIA`) a qualquer momento

### Conteúdo

14. Aula sem vídeo pronto (`ready` no Stream) não fica visível para o aluno
15. Ordem de módulos e aulas é explícita (`ordem`), nunca inferida por data de criação

## Fluxos principais

### Publicar um curso
```
Criar curso (RASCUNHO) → criar módulos → criar aulas → subir vídeo → anexar materiais
  → pré-visualizar como aluno → PUBLICAR → divulgar link
```

### Comprar e assistir
```
Página do curso → comprar → conta → Stripe → webhook → matrícula ATIVA + e-mail
  → sala de aula → assiste → progresso → 100% → certificado
```

### Liberar acesso manualmente
```
Painel → Matrículas → buscar aluno → escolher curso → origem CORTESIA → salvar
  → e-mail de acesso liberado
```

## Contexto do negócio

O produto é de uma **médica**, o que traz obrigações que um curso comum não tem:
publicidade médica regulada pelo CFM, dados sensíveis de saúde em imagens clínicas,
consentimento de pacientes em material didático. Ver `spec.md` → Parte 14.

---

*Atualizado em: 2026-08-20*
