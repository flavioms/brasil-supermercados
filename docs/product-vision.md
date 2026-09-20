# Visão do Produto — Supermercado Brasil

---

## O Problema

### Contexto Econômico

O Brasil atravessa um período de inflação persistente dos alimentos. O IPCA-alimentação
acumula altas consecutivas, com produtos básicos como arroz, feijão, óleo de soja, ovos
e carne subindo toda semana. Para a maioria das famílias brasileiras, o supermercado é o
maior gasto mensal — e a cada visita, o mesmo carrinho custa mais.

Produtos com maior variação histórica de preço no Brasil:
- Carne bovina (alcatra, frango, picanha)
- Hortifruti (tomate, cenoura, batata)
- Óleos vegetais (soja, canola, girassol)
- Ovos
- Café em pó
- Leite integral

O comprometimento da renda das famílias de baixa e média renda com alimentação é
desproporcionalmente alto. Para quem ganha até 3 salários mínimos, o supermercado
representa 30–40% do orçamento mensal.

### A Experiência Atual

- Você entra no supermercado com um orçamento em mente
- Coloca itens no carrinho sem saber o total acumulado
- Chega ao caixa e o valor é diferente do esperado — quase sempre acima
- Às vezes precisa devolver produtos na frente da fila, situação constrangedora
- Não tem como saber, no corredor, se o produto está mais caro que na semana passada
- Não sabe se vale a pena ir ao Assaí mais longe em vez do Carrefour próximo
- Nenhum app resolve esse problema de forma simples, offline e com uma mão só

---

## Proposta de Valor

O Supermercado Brasil não é uma lista de compras. É uma **ferramenta de economia pessoal**
para quem não pode se dar ao luxo de gastar além do planejado.

### O que o app oferece

| Quando | O que o app faz |
|--------|----------------|
| Ao adicionar cada item | Mostra o total acumulado em tempo real |
| Ao marcar item como "no carrinho" | Atualiza o subtotal da sessão |
| Ao escanear um produto (V1) | Avisa se o preço subiu desde a última compra |
| Antes de sair de casa (V2) | Indica qual loja está mais barata para a sua lista |
| No final do mês (V2) | Mostra quanto você gastou e onde economizou |

### Missão

> Colocar o poder da informação de preços na mão de quem mais precisa economizar.

---

## Personas

### Persona Principal — "A Maria"

**Perfil:**
- 35 anos, mãe de família, três filhos (5, 9 e 13 anos)
- Renda familiar: R$ 3.500/mês
- Faz compras semanais, geralmente no Atacadão ou Assaí
- Orçamento semanal para alimentação: R$ 550–600
- Dispositivo: Motorola Moto G (Android 12, RAM 4GB)
- Conectividade dentro do mercado: sinal fraco ou inexistente

**Dores:**
- Preços subiram tanto que não consegue mais comprar tudo o que costumava
- Precisa fazer substituições no corredor ("levo o arroz ou o macarrão?") mas não sabe o impacto no total
- Já passou por situação de devolver produtos no caixa — traumatizante
- Não tem tempo para comparar preços em apps diferentes antes das compras
- Não quer cadastro, não quer tutorial, não quer internet obrigatória

**O que ela precisa:**
- Saber o total antes de chegar ao caixa
- Uma interface que funcione com o polegar enquanto a outra mão segura produtos
- Funcionar mesmo quando o sinal some dentro do mercado

---

### Persona Secundária — "O João"

**Perfil:**
- 28 anos, mora sozinho, analista de TI
- Renda: R$ 4.800/mês
- Faz compras quinzenais no Carrefour ou Extra
- Orçamento quinzenal: R$ 400 para alimentação
- Dispositivo: Samsung Galaxy A54 (Android 13)
- Mais letrado digitalmente, mas quer simplicidade durante as compras

**Dores:**
- Percebe que o mesmo carrinho custa mais a cada visita mas não tem dados para confirmar
- Gostaria de saber se vale a pena ir ao Assaí mais distante em vez do Carrefour perto
- Quer rastrear seus gastos com alimentação ao longo do tempo

**O que ele precisa:**
- Histórico de preços por produto para detectar variações
- Comparativo de estabelecimentos para a sua lista específica
- Exportar dados para planilha de controle financeiro

---

## Declaração de Posicionamento

**Para** famílias brasileiras que precisam economizar no supermercado em um cenário de
inflação persistente dos alimentos,

**o Supermercado Brasil** é um PWA offline-first

**que** mostra o total em tempo real, alerta quando um preço subiu e compara qual loja é
mais barata para os seus produtos —

**ao contrário de** apps como Bring! ou Listonic, que são listas sem preços; iFood e Rappi,
que resolvem entrega mas ignoram completamente a experiência de quem precisa esticar o
orçamento dentro da loja física; e BoaLista, que tentou isso mas parece inativo desde 2018.

---

## Por que PWA (não app nativo)

| Critério | PWA | App Nativo |
|----------|-----|------------|
| Instalação | Zero fricção — link ou QR code | Download na app store |
| Atualização | Instantânea, silenciosa | Depende do usuário atualizar |
| Offline | Service Worker | Requer implementação nativa |
| Android mid-range | Leve, sem overhead de framework | APK pode ser pesado |
| Custo de deploy | Hospedagem web simples | Apple Developer ($99/ano), Play Store |
| Time to first use | Segundos | Minutos (download + instalação) |

**Insight de distribuição**: Um QR code na entrada do supermercado ou em panfletos de
promoção pode gerar adoção imediata no ponto de dor — dentro da loja, na hora da compra.
Nenhum app nativo consegue essa distribuição frictionless.

---

## O que o App NÃO é

- **Não é um app de delivery** — iFood e Rappi já resolvem isso
- **Não é um comparador de preços online** — Buscapé e Google Shopping resolvem
- **Não é um app de receitas** — Cookpad, TudoGostoso resolvem
- **Não é gestão de estoque doméstico** — Out of Milk resolve
- **Não é um app financeiro completo** — Nubank, Mobills resolvem

O Supermercado Brasil faz uma coisa extremamente bem: **ajuda você a economizar dentro
do supermercado físico**.
