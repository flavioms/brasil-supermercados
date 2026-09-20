# Stack Técnica

---

## Visão Geral

A stack foi escolhida com três critérios em ordem de prioridade:
1. **Performance em dispositivos mid-range brasileiros** (Android, RAM 2–4GB)
2. **Offline-first garantido** — zero dependências de rede para o fluxo principal
3. **Produtividade e qualidade de código** — stack familiar que permite iteração rápida e cobertura de testes consistente

---

## Stack por Camada

### Frontend

| Camada | Tecnologia | Versão | Justificativa |
|--------|-----------|--------|---------------|
| Framework | **Next.js** (`output: 'export'`) | 15.x | Gera HTML estático puro — sem servidor Node.js; deploy no Cloudflare Pages; App Router com client components para Dexie |
| Linguagem | **TypeScript** strict | 5.x | Type safety em todo o codebase; `strict: true` elimina classes inteiras de bugs |
| CSS | **Tailwind CSS** | 4.x | CSS utilitário com design tokens via `@theme`; zero runtime; purge automático minimiza bundle de CSS |
| Formatação de moeda | `Intl.NumberFormat` | Nativo | `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — zero dependência externa |

### Armazenamento

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| **Dexie.js** | IndexedDB wrapper | Transações ergonômicas, migrations de schema, `liveQuery` reativo para atualização automática da View; melhor mantido da categoria |
| **localStorage** | Preferências do usuário (tema, configurações simples) | Apenas para dados pequenos e não críticos |

### Service Worker

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| **Workbox** | Estratégias de cache declarativas | Evita os bugs comuns de cache manual; estratégias testadas (StaleWhileRevalidate, CacheFirst, NetworkFirst) |

### Barcode Scan (V1)

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| **BarcodeDetector API** | Scan nativo (Android Chrome) | Zero biblioteca externa; hardware-accelerated; disponível no Chrome 83+ |
| **ZXing.js** (fallback) | Browsers sem BarcodeDetector | Funciona em 100% dos browsers; ~300KB mas loaded lazy |

### Catálogo de Produtos (V0 + V1)

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| **JSON estático embutido** | ~5.000 produtos BR comuns | Zero latência, funciona offline; loaded lazy quando formulário abre |
| **Open Food Facts API** | Lookup por EAN (online) | Gratuito, 6M+ produtos, inclui produtos brasileiros com dados de nutrição |
| **IndexedDB** (cache local) | Produtos já vistos | Lookups subsequentes do mesmo EAN não precisam de rede |

### Gráficos / Analytics (V1)

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| **SVG inline** | Gráficos simples (barras, linhas) | Zero dependência; V0/V1 têm dados suficientemente simples |
| **Chart.js** (opcional V2) | Gráficos mais ricos | Lazy-loaded só quando tela de analytics abre; ~200KB aceitável |

### Backend (V2)

| Tecnologia | Uso | Justificativa |
|-----------|-----|---------------|
| **Cloudflare Workers** | Proxy SEFAZ (NF-e) | Stateless, edge computing, zero armazenamento de dados fiscais, LGPD compliance |
| **Cloudflare Workers** | API de preços crowd-sourced | Escala global, latência baixa para usuários BR |
| **Cloudflare D1 ou Turso** | Banco de dados de preços compartilhados | SQLite serverless; custo zero para escala inicial |

---

## Service Worker — Estratégias de Cache

```
Recurso                          Estratégia              Cache TTL
───────────────────────────────────────────────────────────────────
HTML (index.html)                StaleWhileRevalidate    —
CSS / JS (app shell)             StaleWhileRevalidate    —
Imagens / ícones                 CacheFirst              30 dias
produtos-br.json (catálogo)      CacheFirst              permanente
Open Food Facts API              NetworkFirst + fallback 24 horas
SEFAZ proxy                      NetworkFirst (sem cache) —
```

**Atualização silenciosa**: Quando uma nova versão do app está disponível, o SW instala
em background sem interromper a sessão. Exibe um toast discreto "Atualizar" ao usuário
no momento de conveniência (ao abrir novo tab ou ao voltar para home).

---

## Performance — Metas e Estratégias

### Metas

| Métrica | Meta | Condição |
|---------|------|----------|
| TTI (Time to Interactive) | < 3s | Android mid-range, 4G |
| TTI com cache | < 1s | Visitas repetidas |
| Funcional | < 5s | 3G (signal médio em loja) |
| Funcional offline | 0ms | IndexedDB always-local |

### Estratégias

- **`next/dynamic` com `ssr: false`**: Componentes pesados (autocomplete, scanner) carregados lazy
- **`output: 'export'`**: Sem runtime Next.js no servidor — HTML estático puro servido via CDN
- **Tailwind CSS com purge automático**: CSS final ~5–15KB (apenas classes usadas no build)
- **Virtual list**: Para listas com 50+ itens, renderizar apenas itens visíveis (+ buffer via `react-virtual`)
- **Catálogo `produtos-br.json` via `next/dynamic`**: Carregado apenas quando `AutocompleteInput` monta
- **`inputmode="decimal"`**: Teclado numérico nativo sem JavaScript extra
- **`Intl.NumberFormat` instanciado uma vez**: Criar a instância no módulo `currency.ts`, reutilizar

---

## Dispositivos Alvo

### Perfil de Hardware (Brasil mid-range)

| Característica | Alvo | Realidade |
|---------------|------|-----------|
| SO | Android 10+ | 60% do mercado Android brasileiro |
| RAM | 3–4 GB | Motorola Moto G, Samsung Galaxy A |
| CPU | Snapdragon 4xx/6xx | Mid-range ARM |
| Armazenamento disponível | ~1 GB livre | Estimativa conservadora |
| Browser | Chrome 90+ | ~80% do tráfego mobile BR |

### Graceful Degradation

| API | Comportamento sem suporte |
|-----|--------------------------|
| `BarcodeDetector` | Botão de scan oculto; entrada manual sempre disponível |
| `navigator.vibrate` | Sem háptico; sem degradação funcional |
| `navigator.storage.persist()` | Aviso sobre possível perda de dados; funciona normalmente |
| `Background Sync` | Queue local persiste; drena na próxima abertura do app |
| CSS Grid | Fallback para Flexbox |

---

## Segurança e LGPD

### Modelo de Dados Locais

- **V0/V1**: Todos os dados ficam no dispositivo (IndexedDB), sem transmissão
- **V2**: Compartilhamento de dados de preços é opt-in com consentimento explícito
- **NF-e**: Dados de nota fiscal **nunca** são transmitidos para servidores externos

### HTTPS

Obrigatório para Service Workers — sem HTTPS, o PWA não funciona. Toda hospedagem
deve ter TLS ativo (Cloudflare Pages ou similar fornece automaticamente).

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  connect-src 'self'
    https://world.openfoodfacts.org
    https://nfe.supermercadobrasil.app;
  img-src 'self' data: blob: https://static.openfoodfacts.org;
  style-src 'self' 'unsafe-inline';
```

### Dados Sensíveis — Checklist

- [ ] Sem PII (CPF, e-mail, nome) em localStorage ou IndexedDB (V0/V1)
- [ ] Sem tracking de analytics de terceiros
- [ ] Política de privacidade em PT-BR antes de qualquer coleta
- [ ] Dados de NF-e em store separado com controle explícito de acesso
- [ ] Opt-in granular por tipo de dado (preços, loja, localização)

---

## Manifest PWA

```json
{
  "name": "Supermercado Brasil",
  "short_name": "SupBrasil",
  "description": "Controle seus gastos no supermercado em tempo real",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#2e7d32",
  "lang": "pt-BR",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**`display: standalone`**: Remove a barra de endereço do Chrome quando instalado como PWA —
dá a experiência de app nativo sem instalar nada.

**`orientation: portrait`**: Bloqueia orientação landscape — o layout de uma mão só é
projetado para retrato; landscape quebraria o thumb zone.

---

## Infraestrutura de Deploy (V0)

| Componente | Serviço | Custo |
|-----------|---------|-------|
| Hospedagem estática | Cloudflare Pages | Gratuito |
| CDN + HTTPS | Cloudflare (incluso) | Gratuito |
| CI/CD | GitHub Actions | Gratuito |
| Domínio | Cloudflare Registrar | ~R$ 70/ano |

**V0 não precisa de backend**. Todo o custo de infraestrutura inicial é zero.
