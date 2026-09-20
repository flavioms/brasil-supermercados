# Roadmap do Produto

O produto evolui em 3 versões com critérios claros de "done" antes de avançar para a próxima.
Cada versão entrega valor independente — o usuário não precisa esperar a V2 para se beneficiar.

---

## Princípio Norte

> Cada feature deve responder à pergunta: **"isso ajuda o usuário a economizar?"**
>
> Se a resposta for não, ou incerta, a feature fica fora do escopo.

---

## V0 — MVP: Registrador de Preços

**Objetivo**: Uma pessoa entra no supermercado, registra os itens enquanto coloca no carrinho
e sabe exatamente quanto vai gastar antes de chegar ao caixa. Zero surpresa. Zero internet obrigatória.

### Features

**Lista de Compras**
- [ ] Criar e nomear uma lista de compras
- [ ] Editar o nome e arquivar listas antigas
- [ ] Definir meta de orçamento (opcional)
- [ ] Visualizar todas as listas na tela home

**Adição de Itens**
- [ ] Adicionar item: nome, quantidade, unidade (un/kg/g/L/ml/cx/pct), preço unitário
- [ ] **Autocomplete por histórico local**: ao digitar, sugere itens das listas anteriores do usuário
- [ ] **Autocomplete por catálogo embutido**: lista offline de ~5.000 produtos mais comuns do mercado brasileiro (nomes e marcas, bundlado com o app), sem depender de internet
- [ ] Editar item inline (nome, quantidade, preço)
- [ ] Ajuste rápido de quantidade com stepper (+ / −)

**Total em Tempo Real**
- [ ] **Footer sticky com total geral** — sempre visível, nunca some ← feature inegociável
- [ ] Subtotal da sessão (apenas itens marcados / "no carrinho")
- [ ] Animação de pulso ao alterar o total
- [ ] Barra de progresso de orçamento (verde/âmbar/vermelho)

**Comparativo de Embalagens (Calculadora de Melhor Preço)**
- [ ] Calculadora inline: dado `preço` e `quantidade + unidade`, exibe **preço por unidade de referência** (R$/kg, R$/L, R$/100g, R$/100ml)
- [ ] Ao adicionar itens da mesma categoria com unidades diferentes, destaca qual é mais barato por unidade de medida
- [ ] Exemplo: Óleo 900ml por R$ 8,99 vs. Óleo 2L por R$ 18,00 → mostra R$ 9,99/L vs. R$ 9,00/L → destaca que o 2L é mais barato por litro

**Marcação e Organização**
- [ ] Swipe direita para marcar item como "no carrinho"
- [ ] Swipe esquerda para deletar item
- [ ] Itens marcados colapsam ao fim da lista (não somem)

**PWA e Offline**
- [ ] 100% funcional offline (IndexedDB + Service Worker)
- [ ] Instalável via "Adicionar à tela inicial" (manifest.json)
- [ ] Aviso discreto quando offline
- [ ] Aviso sobre perda de dados em modo incógnito

**Critério de sucesso do V0**:
> Um usuário completa uma compra do início ao fim sem precisar de internet,
> sabe o total exato antes de chegar ao caixa, e consegue operar o app inteiro com o polegar.

---

## V1 — Scan de Código de Barras + Inteligência de Preços

**Objetivo**: Eliminar a digitação manual de nomes de produtos e começar a construir o
histórico de preços que permite alertar o usuário sobre variações — "esse produto está
R$ 2,50 mais caro que da última vez".

### Features

**Scan de Código de Barras**
- [ ] Scanner de câmera com `BarcodeDetector` API nativa (Chrome/Android)
- [ ] Fallback para ZXing.js em browsers sem suporte nativo
- [ ] Lookup no cache local (IndexedDB) primeiro — sem internet para produtos já vistos
- [ ] Fallback para Open Food Facts API para produtos novos
- [ ] Pré-preenchimento do formulário: nome, marca, unidade padrão, último preço conhecido
- [ ] Feature detection: botão de scan oculto se API não disponível; manual sempre funciona

**Histórico e Alertas de Preço**
- [ ] Histórico de preços por produto: `{ EAN, preço, unidade, data, nome da lista/loja }`
- [ ] **Alerta de variação**: "Você comprou esse item por R$ X,XX em [data]. Hoje está R$ Y,YY (+Z%)"
- [ ] Alerta visual (badge) ao adicionar produto com preço maior que o histórico
- [ ] Histórico armazenado localmente no V1

**Comparativo de Embalagens — Aprimorado**
- [ ] Normalização automática via EAN: ao escanear duas embalagens do mesmo produto (tamanhos diferentes), sugere qual é mais barato por unidade de referência
- [ ] Histórico de comparativos salvo por categoria

**Categorização**
- [ ] Categorias automáticas via Open Food Facts (`categoryId` no item)
- [ ] Categorias: Laticínios, Carnes, Hortifruti, Limpeza, Higiene, Mercearia, Bebidas, Padaria, Frios, Outros

**Gráficos de Evolução de Gastos**
- [ ] Gráfico de gastos **semanal**: total por dia da semana nos últimos 7 dias
- [ ] Gráfico de gastos **mensal**: total por semana no mês atual vs. mês anterior
- [ ] Gráfico de gastos **anual**: total por mês nos últimos 12 meses
- [ ] Destaque: "Você gastou X% a mais/menos que no mesmo período anterior"
- [ ] Breakdown por categoria (quanto foi em carnes, laticínios, limpeza, etc.)
- [ ] Exportar relatório (JSON ou CSV) para controle financeiro externo

**Critério de sucesso do V1**:
> Um usuário é alertado de pelo menos 1 variação de preço durante a compra,
> e consegue adicionar 10 itens via scan em menos de 2 minutos.

---

## V2 — NF-e + Comparativo de Preços (Ferramenta de Economia Real)

**Objetivo**: Transformar o app em uma ferramenta coletiva de defesa do consumidor —
transparência de preços usando os dados fiscais obrigatórios que os estabelecimentos
já emitem, mas nenhum app usa.

### Features

**Importação de NF-e (Nota Fiscal Eletrônica)**
- [ ] Scan do QR code do cupom fiscal (NFC-e/NF-e) — **diferencial exclusivo no mercado BR**
- [ ] Importação automática: todos os itens da compra com preços reais da nota fiscal
- [ ] Opção: importar para lista ativa ou criar nova lista a partir da nota
- [ ] Histórico de notas fiscais (local, nunca sai do dispositivo — LGPD)
- [ ] Proxy serverless para SEFAZ (one Cloudflare Worker por UF, stateless)

**Comparativo de Preços**
- [ ] **"Qual loja está mais barata para a minha lista?"** — antes de sair de casa
- [ ] Ranking de lojas por economia estimada para a lista ativa do usuário
- [ ] **"Esse produto está R$ X,XX mais barato no [Estabelecimento Y] a X km"** — no corredor
- [ ] Dados crowd-sourced anônimos com opt-in explícito
- [ ] Comparativo por cidade e estado

**Alertas Proativos**
- [ ] "Seus 5 produtos mais comprados subiram em média X% este mês"
- [ ] "O Atacadão está X% mais barato que o Carrefour para a sua lista desta semana"
- [ ] Alerta de promoção: quando produto historicamente caro está abaixo da média

**Gráficos — V2 Adições**
- [ ] Gráfico de inflação pessoal: variação dos seus preços pagos vs. IPCA-alimentação oficial
- [ ] "Você pagou X% mais caro que a média da sua cidade nesse produto"
- [ ] Mapa de calor de preços por estabelecimento e produto

**Critério de sucesso do V2**:
> Um usuário identifica, antes de sair de casa, em qual loja vai gastar menos para a sua
> lista. Um usuário importa uma nota fiscal completa em menos de 30 segundos.

**Impacto social esperado**:
Com dados agregados e anônimos, o app torna-se uma ferramenta pública de transparência
de preços — coletivizando a informação que hoje só os supermercados possuem.

---

## Fora do Escopo (todas as versões)

| Feature | Motivo |
|---------|--------|
| Entrega de produtos | iFood e Rappi já resolvem melhor |
| Pagamento integrado | Risco regulatório, não é o core value |
| Gestão de estoque doméstico | Out of Milk resolve; distrai do foco |
| Receitas e ingredientes | Cookpad resolve; complexidade alta |
| Compartilhamento social de listas | Risco de LGPD; fora do uso individual |
| Cupons e promoções de lojas | Requer parcerias comerciais complexas |
| Loyalty programs (CPF na loja) | Dado sensível; fora do escopo inicial |

---

## Dependências Técnicas por Versão

| Dependência | V0 | V1 | V2 |
|-------------|-----|-----|-----|
| IndexedDB + Dexie.js | ✅ | ✅ | ✅ |
| Service Worker (Workbox) | ✅ | ✅ | ✅ |
| Catálogo offline (~5k produtos BR) | ✅ | — | — |
| BarcodeDetector API / ZXing.js | — | ✅ | ✅ |
| Open Food Facts API | — | ✅ | ✅ |
| Backend (usuário/sync) | ❌ | Opcional | ✅ |
| Proxy SEFAZ (Cloudflare Worker) | — | — | ✅ |
| Infraestrutura crowd-sourcing | — | — | ✅ |
