# crescix-web

App web autenticado do **CrescIX** — SaaS de gestão financeira pra
pequenos negócios. O usuário cadastra produtos, fornecedores, clientes;
abre orçamentos e pedidos; controla contas a pagar/receber e estoque;
vê fluxo de caixa e insights mensais com sugestões da IA.

Faz parte do ecossistema:
- [crescix-api](https://github.com/crescix/crescix-api) — backend
- [crescix-automations](https://github.com/crescix/crescix-automations) — bot Telegram
- [crescix-landing-page-coding](https://github.com/crescix/crescix-landing-page-coding) — site público

---

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** + **Radix** — design system dark+verde
- **React Hook Form + Zod** — formulários e validação
- **Axios** — cliente HTTP com interceptors (token + 401)
- **Recharts** — gráficos do fluxo de caixa
- **Framer Motion** — micro-animações

---

## Rodar localmente

### 1. Pré-requisitos

A `crescix-api` precisa estar rodando (default `localhost:3333`). Veja o [README dela](https://github.com/crescix/crescix-api#readme).

### 2. Configurar env

```bash
cp .env.local.example .env.local
```

Mínimo necessário:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=crescix_dev_bot   # opcional, pra link de pareamento
```

### 3. Dev server

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor Next em modo dev com Turbopack |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |

---

## Rotas

### Públicas (`src/app/(public)/`)

| Rota | Tela |
|---|---|
| `/login` | Login com e-mail/senha |
| `/cadastro` | Criar conta + consentimento LGPD |
| `/esqueci-senha` | Solicitar e-mail de reset |
| `/redefinir-senha?token=...` | Definir nova senha |
| `/privacidade` | Política de Privacidade |
| `/termos` | Termos de Uso |

### Autenticadas (`src/app/(auth)/`)

| Rota | Tela |
|---|---|
| `/dashboard` | Cards de KPI + onboarding pra novos usuários |
| `/clientes`, `/fornecedores`, `/produtos` | Listagens + CRUD |
| `/vendas/orcamentos`, `/vendas/pedidos` | Vendas (com conversão orçamento→pedido) |
| `/financeiro/pagar`, `/financeiro/receber` | Contas a pagar/receber |
| `/financeiro/fluxo-de-caixa` | Visão consolidada com gráfico |
| `/financeiro/insights` | Análise IA do mês com sugestões |
| `/estoque/entradas`, `/estoque/saidas`, `/estoque/inventario` | Movimentação |
| `/perfil` | Dados do usuário + Vincular Telegram |

---

## Estrutura

```
src/
├── app/                     # App Router do Next
│   ├── (auth)/              # rotas autenticadas + ProtectedRoute + Navbar
│   ├── (public)/            # rotas públicas
│   ├── error.tsx            # error boundary raiz
│   ├── global-error.tsx     # error boundary acima do layout
│   ├── not-found.tsx        # 404 brandado
│   └── layout.tsx           # root layout + providers
├── components/
│   ├── auth/                # ProtectedRoute
│   ├── dashboard/           # cards de KPI, onboarding
│   ├── financeiro/          # forms/items de contas
│   ├── layout/              # navbar
│   ├── lgpd/                # cookie banner
│   ├── ui/                  # shadcn primitives + ConfirmDialog, TableSkeleton
│   └── vendas/              # orcamento-item, etc.
├── context/
│   └── auth-context.tsx     # AuthProvider (token em localStorage)
├── lib/
│   ├── data/                # helpers de domínio (cálculos, formatters)
│   └── utils/
│       ├── api-errors.ts    # extractApiError
│       └── mask.ts          # máscaras (CPF, CEP, telefone, etc.)
├── services/
│   ├── api/
│   │   └── axios-config.ts  # cliente HTTP com interceptor 401
│   ├── auth.ts
│   ├── clientes.ts          # ...e os outros (1 por entidade)
│   └── ...
└── types/                   # tipos compartilhados com a API
```

---

## Convenções

- **Branch base**: `develop`. PRs vão pra `develop`; `main` reflete o último deploy.
- **Commits**: `feat(web): ...`, `fix(web): ...`, `refactor(web): ...`. Pode ter mais escopos quando necessário.
- **Form**: sempre `react-hook-form` + `Zod`. Schemas em `src/services/*.ts` alinhados com a API.
- **Erros**: `extractApiError(err, fallback)` no `catch` → string amigável pro toast/UI.
- **Confirmações destrutivas**: sempre via `<ConfirmDialog>` (não criar modais soltos).

---

## Deploy

Vercel (recomendado) ou qualquer provider que sirva Next.

Configure as variáveis em runtime:

- `NEXT_PUBLIC_API_URL` — URL pública da `crescix-api` (ex.: `https://api.crescix.com.br`). **Obrigatória em prod** — sem ela, o app loga erro claro no console mas continua tentando localhost.
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — sem `@`. Aparece no link de pareamento do `/perfil`.

A build é estática quando possível (`○ Static`) e dinâmica nas rotas com `[id]` (`ƒ Dynamic`).
