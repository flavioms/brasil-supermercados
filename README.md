# Supermercado Brasil

> Ferramenta de economia pessoal para quem faz compras em supermercados brasileiros.

[![Status](https://img.shields.io/badge/status-planejamento-yellow)](docs/roadmap.md)
[![Versão](https://img.shields.io/badge/versão-V0%20MVP-blue)](docs/roadmap.md#v0--mvp-registrador-de-preços)

---

## O que é

O Supermercado Brasil é um PWA (Progressive Web App) offline-first que exibe o total
acumulado da compra **em tempo real** enquanto você percorre os corredores do mercado.

Em um país onde os preços dos alimentos sobem toda semana, o app coloca o poder da
informação na mão de quem mais precisa economizar — sem cadastro, sem internet obrigatória,
sem instalar nada.

---

## O problema que resolve

- Você coloca itens no carrinho sem saber o total
- Chega ao caixa e o valor surpreende (para cima)
- Às vezes precisa devolver produtos na fila
- Não tem como saber se o produto está mais caro que na semana passada
- Não sabe qual loja é mais barata para os **seus** produtos

---

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [Visão do Produto](docs/product-vision.md) | Problema, personas, proposta de valor, posicionamento |
| [Análise de Concorrentes](docs/competitive-analysis.md) | Mapa de apps, gaps de mercado, oportunidades |
| [Regras de Negócio](docs/business-rules.md) | BR-01 a BR-28: todas as regras e validações |
| [Diretrizes de UX](docs/ux-guidelines.md) | UX-01 a UX-26: uso com uma mão, thumb zone, micro-interações |
| [Roadmap](docs/roadmap.md) | V0 → V1 → V2: features e critérios de sucesso |
| [Arquitetura MVC](docs/architecture/mvc-overview.md) | Fluxo de dados, inventário de telas e controllers |
| [Modelo de Dados](docs/architecture/data-model.md) | Entidades, campos, schema IndexedDB |
| [Stack Técnica](docs/architecture/technical-stack.md) | Tecnologias escolhidas e justificativa |

---

## Versões

| Versão | Nome | Status | Objetivo |
|--------|------|--------|----------|
| **V0** | Registrador de Preços | 🟡 Em desenvolvimento | Total em tempo real, 100% offline |
| **V1** | Scan de Código de Barras | ⬜ Planejado | Histórico de preços, alertas de variação |
| **V2** | NF-e + Comparativo | ⬜ Planejado | Transparência de preços, economia máxima |

---

## Princípios Não Negociáveis

1. **Offline-first**: funciona dentro do mercado, mesmo sem sinal
2. **Uma mão só**: todas as ações primárias no terço inferior da tela
3. **Total sempre visível**: footer sticky com o total nunca some
4. **Zero fricção**: nenhuma tela obrigatória antes de começar a usar
5. **Economia real**: cada feature deve ajudar o usuário a gastar menos

---

## Para Desenvolvedores

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/supermercado-brasil
cd supermercado-brasil

# Estrutura planejada do projeto (V0)
src/
  models/        # Entidades + schema Dexie (IndexedDB)
  controllers/   # Lógica de negócio
  views/         # Web Components + telas
  utils/         # Moeda, UUID, validação, háptico
  sw/            # Service Worker (Workbox)
  styles/        # Design tokens + CSS global
  index.html
  manifest.json
```

> **Nota**: O código ainda não existe. Este repositório contém apenas a documentação
> de produto e arquitetura. Consulte o [Roadmap](docs/roadmap.md) para o status atual.
