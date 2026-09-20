# Regras de Negócio

Este documento é a fonte da verdade para todas as regras e validações do sistema.
Toda implementação deve respeitar estas regras. Mudanças requerem atualização aqui primeiro.

---

## V0 — MVP: Registrador de Preços

### Lista de Compras

| ID | Regra |
|----|-------|
| **BR-01** | Uma lista tem nome obrigatório (1–60 caracteres, sem espaços apenas) |
| **BR-02** | Uma lista pode ter meta de orçamento opcional em BRL (valor mínimo: R$ 0,01) |
| **BR-03** | Uma lista pode estar em dois estados: `ativa` ou `arquivada` |
| **BR-04** | Múltiplas listas podem coexistir simultaneamente (sem limite no V0) |
| **BR-05** | Deletar uma lista remove todos os seus itens em cascata (operação irreversível) |
| **BR-06** | O **total geral** da lista = soma de `(quantidade × preço_unitário)` de **todos** os itens |
| **BR-07** | O **subtotal da sessão** = soma de `lineTotal` apenas dos itens com `isChecked = true` |
| **BR-08** | Listas arquivadas não aparecem na tela principal (home), mas são acessíveis via filtro |

### Item da Lista

| ID | Regra |
|----|-------|
| **BR-09** | Um item tem nome obrigatório (1–80 caracteres) |
| **BR-10** | Quantidade mínima: `0,001` \| Quantidade máxima: `9.999` |
| **BR-11** | Preço unitário mínimo: `R$ 0,00` (item grátis é válido) \| Preço máximo: `R$ 99.999,99` |
| **BR-12** | Unidades suportadas: `un`, `kg`, `g`, `L`, `ml`, `cx`, `pct` |
| **BR-13** | Um item pode ser marcado como "no carrinho" (`isChecked = true`) sem ser deletado |
| **BR-14** | Itens marcados **permanecem visíveis** na lista — colapsam ao fim, mas não somem |
| **BR-15** | O total da linha (`lineTotal`) = `quantidade × preço_unitário` (armazenado para performance) |
| **BR-16** | A posição do item na lista é controlada por um inteiro com gap encoding (múltiplos de 1000) |

### Totais e Orçamento

| ID | Regra |
|----|-------|
| **BR-17** | `totalCost` e `checkedTotal` na lista são recomputados após **cada mutação** de item |
| **BR-18** | O progresso do orçamento é calculado sobre o **total geral** (não só os itens marcados) |
| **BR-19** | Ao ultrapassar 100% do orçamento: indicador visual distinto (vermelho + animação de pulso) |
| **BR-20** | A exibição do preço por unidade de medida (R$/kg, R$/L) é calculada a partir de `unitPrice` e `unit` |

### Offline e Persistência

| ID | Regra |
|----|-------|
| **BR-21** | Toda operação (criar, editar, marcar, deletar) funciona **100% offline** |
| **BR-22** | Os dados persistem entre sessões do browser via IndexedDB |
| **BR-23** | Em modo privado/incógnito, o app deve exibir aviso sobre possível perda de dados ao fechar a aba |
| **BR-24** | O app não bloqueia nenhuma ação por falta de conexão — UI otimista, sync em background |

---

## V1 — Scan de Código de Barras + Histórico de Preços

| ID | Regra |
|----|-------|
| **BR-25** | O EAN escaneado busca primeiro no cache local (`products` no IndexedDB), depois na API Open Food Facts |
| **BR-26** | Se o produto não for encontrado no catálogo, o formulário de adição permanece aberto para entrada manual |
| **BR-27** | Um scan bem-sucedido pré-preenche nome, unidade padrão e último preço conhecido — o usuário pode editar antes de confirmar |
| **BR-28** | Cada preço registrado (manual ou por barcode) é salvo no histórico: `{ ean, preço, unidade, data, lista }` |
| **BR-29** | O histórico de preços fica armazenado apenas localmente no V1 |
| **BR-30** | Ao adicionar um item já na base local, o app exibe o último preço registrado e a variação em relação ao atual |
| **BR-31** | A normalização de preço por unidade (R$/kg, R$/100g) é calculada para permitir comparação entre embalagens diferentes |
| **BR-32** | Se `BarcodeDetector` não estiver disponível no browser, o botão de scan é ocultado; entrada manual permanece disponível |

---

## V2 — NF-e + Comparativo de Preços

| ID | Regra |
|----|-------|
| **BR-33** | O QR code do cupom fiscal contém a chave NF-e de 44 dígitos (ou URL contendo essa chave) |
| **BR-34** | A chave NF-e é validada: 44 dígitos numéricos, com verificação do dígito verificador |
| **BR-35** | O fetch da NF-e ocorre via proxy serverless (CORS) — o cliente nunca acessa a SEFAZ diretamente |
| **BR-36** | A importação de NF-e cria itens pré-preenchidos na lista ativa (ou em nova lista, se o usuário preferir) |
| **BR-37** | O `priceSource` de cada item importado via NF-e é marcado como `'nfe'` |
| **BR-38** | **Dados de NF-e NUNCA saem do dispositivo** sem consentimento explícito do usuário (LGPD) — o dado fiscal é sensível pois contém historico vinculado ao CPF do estabelecimento |
| **BR-39** | O comparativo de preços usa histórico anônimo de múltiplos usuários, exclusivamente opt-in |
| **BR-40** | Para contribuir com o comparativo crowd-sourced, o usuário deve optar explicitamente (opt-in, não opt-out) |
| **BR-41** | Dados compartilhados para o comparativo são anonimizados: sem CPF, sem chave NF-e, sem dados pessoais — apenas `{ ean, cnpj_loja, preço, unidade, data }` |
| **BR-42** | O ranking de lojas mais baratas é calculado sobre os **produtos da lista ativa do usuário** (não uma lista genérica) |

---

## Validações — Constantes Compartilhadas

Estas constantes são a fonte da verdade para validação em todas as camadas (Model, Controller, View).

```
LISTA_NOME_MIN          = 1
LISTA_NOME_MAX          = 60
LISTA_ORCAMENTO_MIN     = 0.01

ITEM_NOME_MIN           = 1
ITEM_NOME_MAX           = 80
ITEM_QUANTIDADE_MIN     = 0.001
ITEM_QUANTIDADE_MAX     = 9999
ITEM_PRECO_UNITARIO_MIN = 0.00
ITEM_PRECO_UNITARIO_MAX = 99999.99

UNIDADES_VALIDAS        = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct']
```

---

## Regras de LGPD (Lei Geral de Proteção de Dados)

O app coleta dados pessoais de forma implícita (listas de compras revelam hábitos de consumo).
As seguintes regras se aplicam:

| ID | Regra |
|----|-------|
| **LGPD-01** | Todos os dados ficam no dispositivo do usuário por padrão (V0 e V1) |
| **LGPD-02** | Qualquer compartilhamento de dados com servidores externos exige opt-in explícito com linguagem clara em PT-BR |
| **LGPD-03** | O usuário pode exportar todos os seus dados a qualquer momento (direito de portabilidade) |
| **LGPD-04** | O usuário pode deletar todos os seus dados com uma ação (direito ao esquecimento) |
| **LGPD-05** | Dados de NF-e (notas fiscais) nunca são compartilhados, mesmo com opt-in geral |
| **LGPD-06** | A política de privacidade deve estar disponível em PT-BR antes de qualquer coleta de dados |

---

## Regras de Estado (State Machine)

### Lista de Compras

```
         criar
[NOVA] ──────────→ [ATIVA]
                      │
                      │ arquivar
                      ↓
                  [ARQUIVADA]
                      │
                      │ restaurar
                      ↑
                   (volta para ATIVA)
                      │
                      │ deletar
                      ↓
                  [DELETADA] (irreversível, cascata em itens)
```

### Item da Lista

```
         adicionar
[NOVO] ──────────→ [PENDENTE]
                      │         ← posição na lista = não marcado
                      │ check
                      ↓
                  [NO CARRINHO]  ← posição na lista = seção colapsada
                      │
                      │ uncheck
                      ↑
                   (volta para PENDENTE)
                      │
                      │ deletar
                      ↓
                  [DELETADO] (hard delete do IndexedDB)
```
