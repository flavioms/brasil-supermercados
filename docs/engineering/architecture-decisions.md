# Architecture Decision Records (ADR)

Registro das decisões técnicas significativas e suas justificativas.
Consultar antes de propor mudanças de stack ou padrões.

---

## ADR-001: Next.js com `output: 'export'` (sem SSR)

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: App PWA mobile-first para Android mid-range. Todo o valor do produto no V0/V1 é offline-first — não há servidor para renderizar nada. O desenvolvedor tem domínio profundo de Next.js, o que acelera a entrega e a qualidade.

**Decisão**: Next.js 15 com `output: 'export'` — gera HTML estático puro.

**Justificativa**:
- `output: 'export'` elimina a necessidade de um servidor Node.js — o output é HTML/CSS/JS estático deployável no Cloudflare Pages gratuitamente.
- App Router com Client Components é o padrão correto para componentes que usam Dexie `useLiveQuery` (client-only).
- A familiaridade do desenvolvedor com Next.js resulta em código mais seguro, testado e idiomático do que uma alternativa desconhecida.
- TypeScript strict previne classes inteiras de bugs que JavaScript puro deixaria passar.

**Consequências**:
- `generateStaticParams()` vazia em rotas dinâmicas (`/lista/[id]`) — o ID é lido no cliente via `useParams()`.
- Sem Server Components com `fetch` externo — todo acesso a dados é client-side via Dexie.
- Sem API Routes no V0/V1 — sem backend necessário.
- Bundle inicial ~180–220KB (React + Next runtime) vs. ~30–50KB de Vanilla JS — mitigado por code splitting, lazy loading e cache de Service Worker.

---

## ADR-002: TypeScript strict (sem JavaScript puro)

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Escolha entre TypeScript strict e JavaScript puro.

**Decisão**: TypeScript 5 com `strict: true` + `noUncheckedIndexedAccess`.

**Justificativa**:
- `strict: true` captura em tempo de build: `undefined` não verificado, `null` não tratado, tipos incompatíveis em chamadas de Controller.
- `noUncheckedIndexedAccess` força o tratamento de `undefined` ao acessar arrays — crítico ao trabalhar com resultados de queries Dexie.
- As interfaces TypeScript dos models são a fonte de verdade mais confiável que JSDoc — sempre sincronizadas com o código.
- Next.js já configura TypeScript out-of-the-box — custo de setup é mínimo.

---

## ADR-003: Tailwind CSS v4 (sem CSS Custom Properties manual)

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Escolha de estratégia de CSS.

**Decisão**: Tailwind CSS 4 com design tokens via `@theme` no `globals.css`.

**Justificativa**:
- Tailwind com purge automático gera CSS final de ~5–15KB — menor que CSS custom properties global sem purge.
- `@theme` do Tailwind v4 usa CSS Custom Properties nativas por baixo, preservando o benefício de tokens sem precisar gerenciá-los manualmente.
- Classes utilitárias eliminam a necessidade de inventar nomes de classes BEM para componentes pontuais.
- `prettier-plugin-tailwindcss` mantém a ordem das classes consistente automaticamente — elimina diff noise em PRs.

**Consequências**:
- Classes no JSX podem ser verbosas para componentes complexos — usar `cn()` utility (clsx + tailwind-merge) para condicionais.
- Sem encapsulamento de escopo por componente — disciplina nos seletores continua necessária.

---

## ADR-004: Dexie.js + `dexie-react-hooks` (`useLiveQuery`)

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Estratégia de persistência offline e reatividade com React.

**Decisão**: Dexie.js v4 + `dexie-react-hooks` para integração com React.

**Justificativa**:
- `useLiveQuery` é um hook React que re-renderiza o componente automaticamente quando os dados no IndexedDB mudam — exatamente o comportamento necessário para o footer de totais e a lista de itens.
- Gerencia o ciclo de vida da subscription automaticamente (cancela no unmount) — sem risco de memory leak.
- A combinação Dexie + React é a integração mais testada e documentada para IndexedDB em 2025.
- Sem `useEffect` manual para sincronizar estado local com o banco — o `useLiveQuery` substitui esse padrão.

**Padrão resultante**:
```
useLiveQuery (hook) → dado fresco do banco → componente re-renderiza
Controller → mutação → Dexie propaga → useLiveQuery re-executa
```

Nenhum `useState` para dados que vêm do banco. Estado local (`useState`) apenas para estado de UI (modal aberto, campo de formulário).

---

## ADR-005: Workbox via `@ducanh2912/next-pwa`

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Integração de Service Worker com Next.js.

**Decisão**: Plugin `@ducanh2912/next-pwa` que configura Workbox automaticamente no build do Next.js.

**Justificativa**:
- `next-pwa` é o wrapper mais ativamente mantido de Workbox para Next.js em 2025 (o `next-pwa` original foi abandonado).
- Configura precaching do app shell (JS/CSS gerado pelo Next.js) automaticamente — zero configuração manual.
- Estratégias de cache (StaleWhileRevalidate, CacheFirst) configuradas via opções do plugin no `next.config.ts`.
- O SW é gerado em `public/sw.js` no `npm run build` — não precisa de `sw.js` manual.

---

## ADR-006: Cloudflare Pages para hospedagem

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Hospedagem do app estático com custo zero no V0.

**Decisão**: Cloudflare Pages.

**Justificativa**:
- Gratuito para projetos pessoais (builds ilimitadas no plano atual, bandwidth ilimitado).
- Subdomínio gratuito: `supermercado-brasil.pages.dev` — funciona com HTTPS (necessário para Service Workers) sem configuração adicional.
- Preview URLs automáticas por PR via GitHub Actions.
- CDN global — entrega rápida para usuários brasileiros.
- Expansão natural para Cloudflare Workers no V2 (mesmo provider, sem migration de infra).

**Deploy**: `npm run build` gera o diretório `out/` (HTML estático) que é deployado pelo GitHub Actions.

---

## ADR-007: App Router do Next.js (sem Pages Router)

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Escolha entre App Router e Pages Router.

**Decisão**: App Router (padrão do Next.js 15).

**Justificativa**:
- App Router é o presente e o futuro do Next.js — Pages Router está em modo de manutenção.
- Com `output: 'export'`, os Server Components do App Router são pré-renderizados em HTML estático na build — não há execução de servidor em runtime.
- Componentes que usam Dexie recebem `'use client'` — são hidratados no browser, que é exatamente o comportamento correto para IndexedDB.
- Layout compartilhado (`layout.tsx`) é mais idiomático no App Router do que em `_app.tsx` do Pages Router.

---

## ADR-008: Sem backend no V0/V1

**Status**: Aceito  
**Data**: 2026-09

**Contexto**: Todo o valor do V0 e V1 é offline-first. Backend adicionaria latência, custo e superfície de ataque.

**Decisão**: Zero backend até o V2.

**Implicações**:
- Sem autenticação (sem usuário cadastrado no V0/V1)
- Conformidade LGPD simplificada — nenhum dado pessoal transmitido
- Backup dos dados é responsabilidade do usuário (exportação manual de JSON)
- Backend entra no V2 apenas para proxy SEFAZ e crowd-sourcing de preços, ambos opt-in

---

## O Que Não Está Decidido (V1/V2)

- Autenticação: magic link vs. OAuth vs. anônimo com device ID
- Banco de dados do backend: Cloudflare D1 vs. Turso vs. PlanetScale
- Estratégia de sync: CRDT vs. last-write-wins vs. event sourcing
- Internacionalização (i18n): atualmente hardcoded em PT-BR
