# Análise de Concorrentes

---

## Mapa Completo de Concorrentes

### Apps Globais

| App | Usuários | Força Principal | Fraqueza Crítica | Offline? | Total RT? | Preço BR? |
|-----|----------|----------------|-----------------|----------|-----------|-----------|
| **Bring!** | > 50M | UI visual, colaborativo, PT-BR disponível | Sem rastreio de preços | Parcial | ❌ | ❌ |
| **Listonic** | > 20M | Sincronização, categorização automática | Ads durante compra, itens sumindo | ✅ | ❌ | ❌ |
| **OurGroceries** | > 5M | Sincronização em tempo real, Apple Watch, barcode | Preço solicitado por usuários há 3+ anos, sem resposta | ✅ | ❌ | ❌ |
| **AnyList** | Pago | Receitas, importação de blogs de culinária | Preço 100% manual, sem automação | ✅ | ❌ | ❌ |
| **Groceries Tracker** | Nicho | Histórico de preços pagos, IA de recibo | UI complexa, sem mobile nativo | Parcial | ✅ | ❌ |
| **Basket** | EUA | Comparativo por loja antes da compra | Não funciona durante a compra, dados EUA | ❌ | ❌ | ❌ |
| **Flipp** | América do Norte | Folhetos digitais, cupons semanais | Só pré-compra, não é lista | ❌ | ❌ | ❌ |
| **Out of Milk** | Médio | Gestão de estoque doméstico | UI datada, sem preços | ✅ | ❌ | ❌ |

### Apps Brasileiros

| App | Status | Força Principal | Fraqueza Crítica | Relevância |
|-----|--------|----------------|-----------------|------------|
| **BoaLista** | ⚠️ Inativo (~2018) | Barcode + comparativo de preços locais + offline | Sem continuidade, aparentemente descontinuado | Alta (prova de conceito validado no BR) |
| **iFood** | ✅ Ativo, dominante | 83% do delivery de alimentos no Brasil | Foco em entrega, não acompanha compra física | Baixa (mercado diferente) |
| **Rappi** | ✅ Ativo | Super app (food + grocery + pharma + fintech) | Foco em entrega, não em loja física | Baixa |
| **Mercado Livre** | ✅ Ativo | Maior e-commerce da América Latina | Foco em e-commerce, não em loja física | Baixa |
| **Minhas Economias** | ✅ Ativo (finanças) | Controle financeiro pessoal | Não é específico para supermercado | Baixa |

---

## Análise Detalhada dos Principais Concorrentes

### Bring!

**O que funciona bem:**
- Interface visual com ícones de produtos — reduz leitura em ambiente barulhento
- Colaboração em tempo real para listas compartilhadas
- Disponível em PT-BR com boa localização
- Design limpo e moderno

**O que falha:**
- Preços completamente ausentes — a funcionalidade mais demandada
- Sem total acumulado durante as compras
- Modo offline limitado (assets carregam, mas sync falha)

**Lição para o Supermercado Brasil:** A UI visual de ícones de produtos é um padrão que
funciona bem. Porém, preços e total são o vazio que o Bring! nunca preencheu.

---

### Listonic

**O que funciona bem:**
- Base de 20M+ usuários valida a demanda por listas colaborativas
- Categorização automática por tipo de produto
- Modo offline funcional para listas locais

**O que falha (direto das avaliações de usuários):**
- Propagandas aparecem durante a sessão de compra (notavelmente: anúncio da Shein no meio de uma lista de mercado)
- Pop-ups diários de consentimento de privacidade que ignoram respostas anteriores
- Itens desaparecem das listas sem aviso
- Itens duplicados aparecem espontaneamente
- Sem total acumulado visível

**Lição para o Supermercado Brasil:** Monetização por ads no contexto de uso (dentro do mercado)
é um anti-pattern que destrói a confiança. O modelo deve ser diferente desde o início.

---

### OurGroceries

**O que funciona bem:**
- Sincronização mais rápida entre dispositivos do mercado
- Integração com Apple Watch e Alexa
- Scanner de código de barras (para adição de itens, não comparativo de preços)
- Organização por corredor customizável

**O que falha:**
- Usuários solicitam rastreio de preços há mais de 3 anos nos fóruns de suporte
- O desenvolvedor nunca respondeu a esse pedido
- Sem total acumulado visível durante as compras

**Lição para o Supermercado Brasil:** Existe uma demanda reprimida enorme e não atendida
por rastreio de preços em apps de lista de compras. Esta é literalmente a feature que o
principal concorrente recusou a construir.

---

### BoaLista (Brasil, ~2015–2018)

**História:** Startup do Rio de Janeiro que recebeu investimento anjo de R$ 1 milhão.
Foi o app mais próximo do que o Supermercado Brasil propõe.

**O que fazia certo:**
- Scan de código de barras para comparar preços entre lojas locais
- Modo offline funcional
- Preços inseridos por usuários (crowd-sourcing)
- Comparativo online vs. físico
- Histórico de compras

**Por que falhou (hipótese):**
- Crowd-sourcing de preços é difícil de escalar — dados ficam desatualizados
- Sem usar a NF-e para atualização automática de preços (a lei que obriga QR codes só
  foi plenamente implementada após 2015–2017)
- Pode ter faltado foco no UX de uso único (dentro da loja, uma mão)

**Lição para o Supermercado Brasil:** O BoaLista prova que há demanda real no Brasil.
A diferença agora é que a infraestrutura de NF-e está madura, o que resolve o problema
de dados de preços desatualizados — sem depender de usuários digitando preços manualmente.

---

## Principais Reclamações dos Usuários (cross-app)

Levantadas de reviews nas app stores e fóruns de suporte:

### Bugs Funcionais (mais críticos)
1. **Itens sumindo** durante a sessão de compra — catastrófico no contexto
2. **Itens duplicados** aparecendo espontaneamente
3. **Falha de sync** após updates — listas organizadas cuidadosamente são destruídas
4. **Não consegue apagar itens marcados em massa** — precisa deletar um a um

### Fricção de Monetização
5. **Propagandas durante a compra** — momento de maior concentração do usuário
6. **Pop-ups de consentimento diários** ignorando respostas anteriores
7. **Paywall em funcionalidades básicas** de sync e compartilhamento

### Features Universalmente Solicitadas (não entregues por nenhum)
8. **Total em tempo real** visível enquanto compra — o pedido mais frequente
9. **Rastreio de variação de preço** por produto
10. **Split must-have vs. opcional** dentro da lista

### UX
11. **Ações críticas no topo da tela** — inacessíveis com uma mão
12. **Hierarquia de menus profunda** — dificulta uso em movimento
13. **Sem modo offline** em apps que dependem de rede

---

## Mapa de Oportunidades

### O Que Nenhum App Faz (especificamente no Brasil)

```
                    Funciona offline?
                    ┌──────YES──────┬──────NO───────┐
                    │               │               │
          YES       │  ★ NOSSO     │  Basket       │
Total em            │    ESPAÇO    │  (só pré-     │
tempo real?         │               │  compra)      │
          ──────────┼───────────────┼───────────────┤
          NO        │  Listonic     │  Bring!       │
                    │  OurGroceries │  iFood        │
                    │  BoaLista†    │  Rappi        │
                    └───────────────┴───────────────┘
                    † Inativo
```

### Cinco Diferenciais Cumulativos

| # | Diferencial | Complexidade | Impacto |
|---|-------------|-------------|---------|
| 1 | Offline-first garantido | Baixa | Alto |
| 2 | Total em tempo real (sticky footer) | Baixa | Alto |
| 3 | UX de uma mão só | Média | Alto |
| 4 | Scan de código de barras + histórico de preços | Média | Muito Alto |
| 5 | **NF-e QR code** → importação automática de recibos | Alta | **Exclusivo no mercado** |

### O Diferencial da NF-e (exclusivo Brasil)

Todo supermercado brasileiro é **obrigado por lei** a emitir NFC-e (Nota Fiscal de Consumidor
Eletrônica) com um QR code no cupom. Esse QR code aponta para um endpoint da SEFAZ (Secretaria
da Fazenda) que retorna todos os itens comprados, quantidades e preços pagos em formato estruturado.

**Impacto:** O usuário escaneia o QR code do cupom ao sair do mercado → o app importa
automaticamente toda a compra com preços reais → o histórico de preços por produto por loja
se constrói sozinho, sem nenhuma digitação.

Nenhum app de lista de compras brasileiro usa essa infraestrutura. É a maior janela de
oportunidade de diferenciação do projeto.

---

## Conclusão Estratégica

O mercado brasileiro de apps de compras físicas tem um vácuo claro:
- **BoaLista** era a aposta certa mas parece inativa
- **Listonic/Bring/OurGroceries** resolvem lista, não preço
- **iFood/Rappi/Mercado Livre** resolvem delivery, não loja física

O Supermercado Brasil entra nesse vácuo com:
1. Uma proposta direta e relevante para o contexto de inflação
2. A infraestrutura fiscal do Brasil (NF-e) como diferencial técnico exclusivo
3. UX construído do zero para uso no corredor do mercado, com uma mão
