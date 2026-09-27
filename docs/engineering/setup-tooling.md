# Tooling Setup

Stack: **Next.js 15 + TypeScript 5 + Tailwind CSS 4**

---

## `package.json`

```json
{
  "name": "supermercado-brasil",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev":           "next dev",
    "build":         "next build",
    "start":         "next start",
    "lint":          "next lint && tsc --noEmit",
    "test":          "vitest run",
    "test:watch":    "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e":      "playwright test",
    "format":        "prettier --write src",
    "format:check":  "prettier --check src",
    "validate":      "npm run lint && npm run test"
  },
  "dependencies": {
    "next":                "^15.x",
    "react":               "^19.x",
    "react-dom":           "^19.x",
    "dexie":               "^4.x",
    "dexie-react-hooks":   "^1.x",
    "@ducanh2912/next-pwa":"^10.x"
  },
  "devDependencies": {
    "typescript":             "^5.x",
    "@types/node":            "^22.x",
    "@types/react":           "^19.x",
    "@types/react-dom":       "^19.x",
    "tailwindcss":            "^4.x",
    "@tailwindcss/postcss":   "^4.x",
    "eslint":                 "^9.x",
    "eslint-config-next":     "^15.x",
    "@typescript-eslint/eslint-plugin": "^8.x",
    "@typescript-eslint/parser":        "^8.x",
    "prettier":               "^3.x",
    "prettier-plugin-tailwindcss": "^0.6.x",
    "vitest":                 "^2.x",
    "@vitest/coverage-v8":    "^2.x",
    "@testing-library/react": "^16.x",
    "@testing-library/user-event": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "fake-indexeddb":         "^6.x",
    "jsdom":                  "^25.x",
    "@playwright/test":       "^1.x"
  }
}
```

---

## Next.js (`next.config.ts`)

```typescript
import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  output: 'export',          // static HTML — no Node.js server, works on Cloudflare Pages
  trailingSlash: true,       // /lista/123/ → generates lista/123/index.html (required for Cloudflare Pages)
  images: {
    unoptimized: true,       // next/image optimization requires a server; disabled in static export
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default withPWA({
  dest: 'public',            // sw.js and workbox generated in public/
  disable: process.env.NODE_ENV === 'development',
  register: true,
  reloadOnOnline: true,
})(nextConfig);
```

**Consequences of `output: 'export'`**:
- Dynamic routes (`/lista/[id]`) need `generateStaticParams()` or client-side routing
- No Server Components with `fetch` to external APIs
- No API Routes
- All data access is client-side (Dexie.js)

For dynamic routes with `output: 'export'`:
```typescript
// src/app/lista/[id]/page.tsx
export function generateStaticParams() {
  return []; // empty = Next.js does not pre-render; page loads on the client
}
```

---

## TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Tailwind CSS v4 (`postcss.config.mjs`)

```javascript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Tailwind v4 does not use `tailwind.config.js` — all configuration lives in `globals.css` via `@theme`.

---

## ESLint (`eslint.config.mjs`)

```javascript
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any':      'error',
      '@typescript-eslint/no-unused-vars':       ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Security
      'no-eval':               'error',
      'no-implied-eval':       'error',
      'no-new-func':           'error',

      // React
      'react/no-danger':       'error',   // forbids dangerouslySetInnerHTML

      // Quality
      'no-console':            ['warn', { allow: ['error', 'warn'] }],
      'eqeqeq':                ['error', 'always'],
      'prefer-const':          'error',
    },
  },
];
```

---

## Prettier (`.prettierrc`)

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`prettier-plugin-tailwindcss` automatically sorts Tailwind classes into canonical order — eliminates diff noise in PRs.

`.prettierignore`:
```
.next/
node_modules/
public/
coverage/
src/data/
```

---

## `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## `.gitignore`

```
# Next.js
.next/
out/

# Dependencies
node_modules/

# Tests
coverage/
playwright-report/
test-results/

# Workbox (generated by next-pwa)
public/sw.js
public/workbox-*.js

# Environment
.env
.env.*
!.env.example

# System
.DS_Store
*.local
```

---

## Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines:      80,
        functions:  80,
        branches:   70,
        statements: 80,
      },
      include: [
        'src/controllers/**',
        'src/utils/**',
        'src/models/**',
        'src/hooks/**',
      ],
      exclude: [
        'src/app/**',
        'src/components/**',
        'src/data/**',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

`tests/setup.ts`:
```typescript
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
```

---

## Playwright (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // "Maria" persona — mid-range Android
    {
      name: 'Android Chrome',
      use: { ...devices['Pixel 5'], browserName: 'chromium' },
    },
    {
      name: 'Desktop Chrome',
      use: devices['Desktop Chrome'],
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, 'feat/**', 'fix/**']
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci

      - name: Lint + Type check
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Tests with coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
        if: always()

      - name: Build (verifies that the static export works)
        run: npm run build

  deploy-preview:
    needs: validate
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci && npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken:   ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId:  ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: supermercado-brasil
          directory:  out          # next build with output:export generates into /out
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}

  deploy-production:
    needs: validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci && npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken:   ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId:  ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: supermercado-brasil
          directory:  out
```

---

## Initial Setup Checklist

```bash
# 1. Create the Next.js project with TypeScript
npx create-next-app@latest supermercado-brasil \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

cd supermercado-brasil

# 2. Install project dependencies
npm install dexie dexie-react-hooks @ducanh2912/next-pwa

# 3. Install additional devDependencies
npm install --save-dev \
  vitest @vitest/coverage-v8 \
  @vitejs/plugin-react \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  fake-indexeddb jsdom \
  @playwright/test \
  prettier-plugin-tailwindcss

# 4. Install Playwright browsers
npx playwright install chromium

# 5. Create the directory structure
mkdir -p src/{controllers,hooks,utils,data}
mkdir -p tests/{unit/{controllers,models,utils,hooks},integration,e2e}
mkdir -p .github/workflows

# 6. Verify that everything works
npm run lint
npm run build
npm test
```

---

## GitHub Secrets

| Secret | When |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | V0 (deploy) |
| `CLOUDFLARE_ACCOUNT_ID` | V0 (deploy) |

Configure at: GitHub repo → Settings → Secrets and variables → Actions.
