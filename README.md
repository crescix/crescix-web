# crescix-web

App web autenticado do **CrescIX** — SaaS de gestão financeira pra
pequenos negócios. O usuário cadastra produtos, fornecedores, clientes;
abre orçamentos e pedidos; controla contas a pagar/receber e estoque;
vê fluxo de caixa, insights mensais com sugestões da IA e gerencia a
própria assinatura via PIX (Mercado Pago).

Faz parte do ecossistema:
- [crescix-api](https://github.com/crescix/crescix-api) — backend
- [crescix-automations](https://github.com/crescix/crescix-automations) — bot Telegram
- [crescix-automations-wpp](https://github.com/crescix/crescix-automations-wpp) — bot WhatsApp via Whapi
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
- **qrcode.react** — render do QR code do PIX
- **@sentry/nextjs** — monitoramento de erros (no-op sem `NEXT_PUBLIC_SENTRY_DSN`)

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

Opcionais (Sentry — sem isso roda normal, só não reporta erros):

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=mesmo-valor-acima
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
| `npm run build` | Build de produção (faz upload de source map se `SENTRY_AUTH_TOKEN` setado) |
| `npm run start` | Serve o build |
| `npm run lint` | ESLint |

---

## Rotas

### Públicas (`src/app/(public)/`)

| Rota | Tela |
|---|---|
| `/login` | Login com e-mail/senha. Aceita query `?registered=1&email=...` (banner âmbar pós-cadastro) e `?verified=1` (banner verde pós-confirmação) |
| `/cadastro` | Criar conta + consentimento LGPD. Redireciona pra `/login` com banner depois |
| `/verificar-email?token=...` | Recebe o link clicável do e-mail e confirma a conta |
| `/esqueci-senha` | Solicitar e-mail de reset |
| `/redefinir-senha?token=...` | Definir nova senha |
| `/privacidade` | Política de Privacidade (LGPD + Mercado Pago + Resend + Sentry) |
| `/termos` | Termos de Uso (cobre planos, PIX, direito de arrependimento) |

### Autenticadas (`src/app/(auth)/`)

| Rota | Tela |
|---|---|
| `/dashboard` | Cards de KPI + onboarding pra novos usuários |
| `/assinatura` | Status + plano + checkout PIX + histórico de pagamentos |
| `/clientes`, `/fornecedores`, `/produtos` | Listagens + CRUD |
| `/vendas/orcamentos`, `/vendas/pedidos` | Vendas (com conversão orçamento→pedido) |
| `/financeiro/pagar`, `/financeiro/receber` | Contas a pagar/receber |
| `/financeiro/fluxo-de-caixa` | Visão consolidada com gráfico |
| `/financeiro/insights` | Análise IA do mês com sugestões |
| `/estoque/entradas`, `/estoque/saidas`, `/estoque/inventario` | Movimentação |
| `/perfil` | Dados do usuário + Vincular Telegram/WhatsApp |

O layout `(auth)` mostra automaticamente:
- **EmailVerificationBanner** se o usuário tem `emailVerified: false`
- **SubscriptionBanner** se trial está acabando ou já venceu

---

## Estrutura

```
src/
├── app/                     # App Router do Next
│   ├── (auth)/              # rotas autenticadas + ProtectedRoute + Navbar
│   │   ├── assinatura/      # tela de planos + PIX + histórico
│   │   └── ...
│   ├── (public)/            # rotas públicas (login/cadastro/verificar-email/legal)
│   ├── error.tsx            # error boundary raiz
│   ├── global-error.tsx     # error boundary acima do layout (chama Sentry)
│   ├── not-found.tsx        # 404 brandado
│   ├── icon.png             # favicon CrescIX
│   └── layout.tsx           # root layout + providers
├── instrumentation.ts       # carrega Sentry server/edge conforme NEXT_RUNTIME
├── components/
│   ├── auth/                # ProtectedRoute
│   ├── dashboard/           # cards de KPI, onboarding
│   ├── financeiro/          # forms/items de contas
│   ├── layout/              # navbar + banners (verificação, assinatura)
│   ├── lgpd/                # cookie banner
│   ├── ui/                  # shadcn primitives + ConfirmDialog, TableSkeleton, Toast
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
│   ├── assinatura.ts        # status + criar PIX + payments
│   ├── email-verification.ts
│   ├── clientes.ts          # ...e os outros (1 por entidade)
│   └── ...
└── types/                   # tipos compartilhados com a API
```

Os 3 arquivos `sentry.{client,server,edge}.config.ts` ficam na raiz do projeto e são carregados pelo `next.config.ts` via `withSentryConfig`.

---

## Convenções

- **Fluxo de branches**: PRs vão pra `develop`. Merges em `develop` viram preview no Vercel. `main` reflete o que está em produção.
- **Commits**: `feat(web): ...`, `fix(web): ...`, `refactor(web): ...`. Para mudanças que tocam só docs, `docs: ...`.
- **Form**: sempre `react-hook-form` + `Zod`. Schemas em `src/services/*.ts` alinhados com a API.
- **Erros**: `extractApiError(err, fallback)` no `catch` → string amigável pro toast/UI. Erros não tratados sobem pro `error.tsx` (ou `global-error.tsx`) que chamam Sentry.
- **Confirmações destrutivas**: sempre via `<ConfirmDialog>` (não criar modais soltos).
- **Mobile**: navbar mobile + cookie banner já usam o helper de `globals.css` que força composição GPU em elementos com `backdrop-blur` — não quebra scroll em Xiaomi.

---

## Deploy

**Provider em produção: Vercel.** O backend fica no Render.

### Variáveis em produção (Vercel → Project → Settings → Environment Variables)

| Var | Obrigatória | Notas |
|-----|-------------|-------|
| `NEXT_PUBLIC_API_URL` | sim | `https://api.crescix.com.br` |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | opcional | sem `@`, aparece no link de pareamento |
| `NEXT_PUBLIC_SENTRY_DSN` | opcional | DSN do projeto Sentry. Sem ela, SDK fica em no-op |
| `SENTRY_DSN` | opcional | mesmo valor — usado no server-side do Next |
| `SENTRY_ORG` | opcional | pra upload de source maps no build |
| `SENTRY_PROJECT` | opcional | idem |
| `SENTRY_AUTH_TOKEN` | opcional | idem — gerado em sentry.io/settings/account/api/auth-tokens |

### Checklist pré-deploy

- [ ] Domínio `app.crescix.com.br` apontando pro Vercel (DNS no Registro.br)
- [ ] `NEXT_PUBLIC_API_URL` aponta pra produção, não localhost
- [ ] CORS da API permite o domínio do Vercel (lá no Render)
- [ ] Build local passa (`npm run build`)
- [ ] Sentry recebe eventos em produção (testar com `throw` num useEffect temporário)

A build é estática quando possível (`○ Static`) e dinâmica nas rotas com `[id]` (`ƒ Dynamic`).

---

## Quando algo der errado em produção

Erros 5xx do backend são reportados automaticamente no Sentry. Erros do próprio Next também. Ver [`crescix-api/docs/RUNBOOK.md`](https://github.com/crescix/crescix-api/blob/main/docs/RUNBOOK.md) pro guia operacional completo.
