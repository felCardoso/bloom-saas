# Bloom — CRM para Revendedoras de Cosméticos

SaaS mobile-first para revendedoras de cosméticos gerenciarem clientes, pedidos, estoque, agenda e campanhas de WhatsApp. Construído com Next.js App Router e Supabase.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Stack](#stack)
3. [Arquitetura](#arquitetura)
4. [Módulos da aplicação](#módulos-da-aplicação)
5. [Banco de dados](#banco-de-dados)
6. [Sistema de planos](#sistema-de-planos)
7. [Autenticação e segurança](#autenticação-e-segurança)
8. [Notificações](#notificações)
9. [Pagamentos (Asaas)](#pagamentos-asaas)
10. [Configuração local](#configuração-local)
11. [Variáveis de ambiente](#variáveis-de-ambiente)
12. [Deploy (Vercel)](#deploy-vercel)
13. [Queries de monitoramento](#queries-de-monitoramento)
14. [Sugestões de escalabilidade](#sugestões-de-escalabilidade)

---

## Visão geral

O Bloom resolve um problema real de revendedoras Avon, Natura, Boticário e similares: a gestão do negócio ainda é feita em cadernos, planilhas e grupos de WhatsApp. O app oferece:

- **Dashboard** com KPIs de receita, pedidos e clientes ativos
- **Clientes** com histórico de compras, aniversários e status de relacionamento
- **Pedidos** com controle de status e baixa automática de estoque
- **Produtos** com estoque, custo, margem e histórico de movimentações
- **Agenda** para follow-ups, entregas e eventos
- **Mensagens** com templates de WhatsApp personalizáveis
- **Relatórios** gráficos de receita, categorias e ranking de clientes
- **Notificações** in-app e push (PWA) para aniversários, estoque baixo e pedidos pendentes

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind v4 + lucide-react |
| Gráficos | Recharts |
| Banco | Supabase (PostgreSQL 15 + RLS) |
| Auth | Supabase Auth (email/senha, magic link) |
| Realtime | Supabase Realtime (notificações in-app) |
| Push | web-push 3.6.7 via VAPID |
| Pagamentos | Asaas (gateway brasileiro — Pix, boleto, cartão) |
| E-mail | Resend (transacional) |
| Exportação | xlsx (CSV/Excel) |
| Datas | date-fns v4 |
| Deploy | Vercel (Hobby → 2 crons) |
| Linguagem | TypeScript 5.9 |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Next.js (Vercel)                  │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ App Router   │  │ Server       │  │ API       │  │
│  │ (RSC + CC)   │  │ Actions      │  │ Routes    │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                │        │
│         └─────────────────┴────────────────┘        │
│                           │                         │
└───────────────────────────┼─────────────────────────┘
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
   │  Supabase   │   │    Asaas    │   │   Resend    │
   │  (DB + Auth │   │ (Pagamento) │   │   (Email)   │
   │  + Realtime)│   └─────────────┘   └─────────────┘
   └─────────────┘
```

### Convenções de renderização

- **RSC (React Server Components)**: páginas que fazem fetch de dados — `page.tsx` e `layout.tsx`
- **Client Components**: qualquer arquivo com `useState`, `useEffect`, `onClick` ou hooks — nomeados `_client.tsx` ou `view.tsx`
- **Server Actions**: `lib/actions/*.ts` com `"use server"` — retornam `{ error?: string }` e chamam `revalidatePath()`
- **API Routes**: integrações externas (Asaas webhook, exportação, crons) em `app/api/`

### Fluxo de dados típico

```
Usuário clica → Client Component
  → chama Server Action (lib/actions/*.ts)
    → Supabase query com RLS (user_id = auth.uid())
      → revalidatePath() invalida cache do RSC
        → router.refresh() re-renderiza o client
```

---

## Módulos da aplicação

```
app/
├── (auth)/
│   ├── login/                  # Login com email/senha
│   ├── registro/               # Cadastro com criação de perfil
│   └── recuperar-senha/        # Reset de senha via Supabase Auth
│
├── (dashboard)/
│   ├── dashboard/              # KPIs: receita, pedidos, clientes, top produtos
│   ├── clientes/               # CRUD completo + filtros por status + histórico
│   ├── pedidos/                # CRUD + status + pagamento + baixa de estoque
│   ├── produtos/               # CRUD + estoque + histórico de movimentações
│   ├── agenda/                 # Eventos: entrega, follow-up, aniversário, outro
│   ├── mensagens/              # Templates WhatsApp + envio direto (plano Plus+)
│   ├── relatorios/             # Gráficos de receita, categorias, ranking (plano Plus+)
│   ├── configuracoes/          # Perfil, plano, notificações, aparência, segurança
│   └── pricing/                # Página de planos com CTA de upgrade
│
├── (public)/
│   ├── privacidade/
│   ├── termos/
│   ├── sobre/
│   └── suporte/
│
├── api/
│   ├── asaas/
│   │   ├── checkout/           # Cria sessão de checkout no Asaas
│   │   ├── portal/             # Portal do cliente para gerenciar assinatura
│   │   ├── cancel/             # Cancela assinatura (agenda downgrade)
│   │   ├── revert-downgrade/   # Reverte downgrade agendado
│   │   ├── invoices/           # Lista faturas do cliente
│   │   ├── subscription/       # Detalhes da assinatura atual
│   │   └── webhook/            # Recebe eventos de pagamento do Asaas
│   ├── cron/
│   │   ├── birthday/           # Diário 08:00 — push/in-app para aniversários do dia seguinte
│   │   └── daily/              # Diário 09:00 — pedidos pendentes 7d+ e estoque ≤ 5 unidades
│   └── export/                 # Download CSV/Excel de clientes, pedidos, produtos
│
├── ~offline/                   # Página exibida pelo Service Worker quando offline
├── manifest.ts                 # Web App Manifest (PWA)
└── layout.tsx                  # Root layout com providers de tema, plano e perfil

lib/
├── actions/                    # Server Actions por domínio
│   ├── auth.ts                 # login, logout
│   ├── clientes.ts             # getClientes, addCliente, updateCliente, deleteCliente
│   ├── vendas.ts               # getVendas, addVenda (↓ estoque), updateVendaStatus, deleteVenda
│   ├── produtos.ts             # getProdutos, addProduto, updateProduto, deleteProduto
│   ├── agenda.ts               # getEventos, addEvento, updateEvento, deleteEvento
│   ├── mensagens.ts            # getTemplates, addTemplate, updateTemplate, deleteTemplate
│   ├── estoque.ts              # adicionarEstoque (entrada manual + histórico)
│   ├── notificacoes.ts         # getNotificacoes, markAsRead, markAllAsRead
│   ├── push.ts                 # savePushSubscription, deletePushSubscription
│   ├── profile.ts              # getProfile, updateProfile, startTrial, saveCpfForTrial
│   ├── relatorios.ts           # dados agregados para relatórios
│   ├── dashboard.ts            # dados do dashboard
│   ├── account.ts              # deleteAccount (cancela Asaas + grava blocklist + hard-delete)
│   ├── categorias.ts           # getCategorias, addCategoria, deleteCategoria
│   ├── csv.ts                  # importClientesCSV
│   ├── feedback.ts             # submitFeedback
│   ├── plan-limit.ts           # checkPlanLimit (valida limites antes de criar)
│   └── search.ts               # busca global
├── plans.ts                    # Definição dos planos Free / Plus / Premium
├── plan-context.tsx            # usePlan() — planId, plan, isOnTrial, canAdd(), hasFeature()
├── theme-context.tsx           # useTheme() — light/dark + primaryColor
├── profile-context.tsx         # useProfile() — dados do perfil logado
├── push.ts                     # sendPushNotification via web-push + VAPID
├── email.ts                    # sendOrderConfirmationEmail, sendLowStockEmail (Resend)
├── asaas.ts                    # asaasRequest() — wrapper autenticado para a API Asaas
├── supabase/
│   ├── client.ts               # createBrowserClient (client-side)
│   └── server.ts               # createServerClient (server-side, cookies) + createServiceClient
├── types.ts                    # Client, Order, Product, ScheduleEvent, WhatsAppTemplate…
└── utils.ts                    # cn(), formatCurrency(), formatDate(), formatPhone(), formatPhoneInput()

public/
└── sw.js                       # Service Worker: cache offline + handler de push notifications

components/
├── NotificationBell.tsx        # Sino com badge + dropdown + Supabase Realtime
├── PwaUpdateBanner.tsx         # Banner de nova versão disponível
└── layout/
    ├── Header.tsx
    ├── Sidebar.tsx             # Navegação desktop
    └── BottomNav.tsx           # Navegação mobile (tab bar)
```

---

## Banco de dados

Todas as tabelas (exceto `trial_blocklist`) têm **RLS habilitado** com políticas `user_id = auth.uid()`.

```sql
perfis_usuarios        -- Perfil do usuário: plano, trial, Asaas IDs, CPF, preferências
clientes               -- Clientes da revendedora: nome, telefone, aniversário, status
vendas                 -- Pedidos: cliente, valor total, status, forma de pagamento
itens_venda            -- Itens de cada pedido: produto, quantidade, preço no momento
produtos               -- Catálogo: nome, marca, categoria, estoque, custo, preço de venda
movimentacoes_estoque  -- Histórico de entradas, saídas e ajustes de estoque
eventos_agenda         -- Agenda: follow-up, entrega, aniversário, outro
whatsapp_templates     -- Templates de mensagem WhatsApp por usuário
notificacoes           -- Notificações in-app: lidas/não lidas, dados extras (JSONB)
push_subscriptions     -- Subscriptions VAPID por usuário (unique por endpoint)
trial_blocklist        -- Hashes de email+CPF para bloquear reuso do trial (sem FK)
```

### Diagrama simplificado

```
perfis_usuarios (1) ──────────────────────────── (N) clientes
                                                      │
                                                      └── (N) vendas
                                                               │
                                                               ├── (N) itens_venda ──── (N) produtos
                                                               │                              │
                                                               │                        movimentacoes_estoque
                                                               └── status: pendente | confirmado | entregue | cancelado
```

### Views de monitoramento (SQL Editor)

```sql
SELECT * FROM v_saas_overview;        -- Snapshot: usuários, planos, MRR, trials
SELECT * FROM v_plan_mrr;             -- MRR detalhado por plano
SELECT * FROM v_trial_funnel;         -- Taxa de conversão do trial
SELECT * FROM v_signups_30d;          -- Cadastros diários (30 dias)
SELECT * FROM v_trial_expiring_3d;    -- Trials expirando em 3 dias
SELECT * FROM v_diag_users_sem_perfil;
SELECT * FROM v_diag_vendas_sem_cliente;
SELECT * FROM v_diag_itens_sem_produto;
SELECT * FROM v_diag_estoque_negativo;
SELECT * FROM v_diag_vendas_valor_zero;
SELECT * FROM v_trial_blocklist_stats;
```

---

## Sistema de planos

| Feature | Free | Plus (R$ 29/mês) | Premium (R$ 59/mês) |
|---------|------|------------------|----------------------|
| Clientes | 30 | 200 | Ilimitado |
| Pedidos/mês | 20 | 150 | Ilimitado |
| Produtos | 20 | 100 | Ilimitado |
| Relatórios | — | Básicos | Avançados |
| Mensagens WhatsApp | — | Ilimitado | Ilimitado |
| Alertas de aniversário | — | Sim | Sim |
| Alertas de estoque | — | Sim | Sim |
| Exportação CSV | — | — | Sim |
| Trial gratuito (7 dias Plus) | Sim (1x) | — | — |

O trial é bloqueado por hash de e-mail **e** CPF armazenados na tabela `trial_blocklist` — sobrevive à exclusão de conta.

O estado do plano é lido pelo hook `usePlan()` disponível em qualquer Client Component:

```tsx
const { planId, plan, isOnTrial, trialDaysLeft, hasFeature, canAdd } = usePlan();

if (!hasFeature("reportsBasic")) return <LockedGate />;
if (!canAdd("clients")) return <LimitError />;
```

---

## Autenticação e segurança

- **Supabase Auth** com email/senha e magic link
- Sessão mantida via cookies HTTP-only (`@supabase/ssr`)
- Middleware em `middleware.ts` redireciona rotas protegidas para `/login`
- Todas as Server Actions validam `supabase.auth.getUser()` antes de qualquer query
- RLS no banco garante isolamento total entre usuários
- `createServiceClient()` (service role key) usado apenas em cron jobs, webhook e operações admin

---

## Notificações

### In-app
- Tabela `notificacoes` com Supabase Realtime
- `NotificationBell.tsx` assina o canal `notificacoes:user_id=eq.{uid}` e atualiza em tempo real
- Para habilitar: `ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;`

### Push (PWA)
- Service worker em `public/sw.js` registra o handler `push`
- VAPID keys em variáveis de ambiente
- A chave pública precisa ser convertida com `urlBase64ToUint8Array()` antes de `pushManager.subscribe()` — passar string diretamente falha silenciosamente
- Subscriptions salvas em `push_subscriptions` com unique index em `(user_id, endpoint)`

### Cron jobs (Vercel)
| Rota | Horário | O que faz |
|------|---------|-----------|
| `/api/cron/birthday` | 08:00 diário | Busca clientes com aniversário no dia seguinte; cria notificação in-app + envia push |
| `/api/cron/daily` | 09:00 diário | Pedidos pendentes há 7+ dias + produtos com estoque ≤ 5; cria notificações in-app + push + e-mail |

Teste manual:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://seu-dominio.vercel.app/api/cron/birthday
```

---

## Observabilidade (Sentry)

SDK do `@sentry/nextjs` instalado mas **gated por env var** — sem `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` configurados o SDK é no-op (não faz nenhuma requisição, não polui o console). Em produção, basta setar as vars na Vercel e o tracking começa automático.

### Arquivos

- `instrumentation.ts` — Next.js carrega para Node e Edge runtimes
- `sentry.server.config.ts` — runtime Node (Server Actions, API Routes, RSC)
- `sentry.edge.config.ts` — runtime Edge (middleware)
- `instrumentation-client.ts` — runtime browser
- `next.config.ts` — envolto com `withSentryConfig` (build no-op sem `SENTRY_AUTH_TOKEN`)

### Para ativar em produção

1. Criar projeto no Sentry → copiar DSN
2. Vercel → Settings → Environment Variables → adicionar:
   - `NEXT_PUBLIC_SENTRY_DSN` (público, OK expor)
   - `SENTRY_DSN` (mesmo valor; usado no server)
   - `SENTRY_ORG` + `SENTRY_PROJECT` + `SENTRY_AUTH_TOKEN` (só pra upload de sourcemaps)
3. Redeploy

### Defaults setados

- `enabled: production` apenas — dev local nunca envia evento
- `tracesSampleRate: 0.1` (10% das requests viram performance traces)
- `sendDefaultPii: false` (LGPD — email/IP off por padrão)
- Session Replay desligado (custo + privacidade); comentário em `instrumentation-client.ts` mostra como ligar
- `tunnelRoute: "/monitoring"` (Sentry passa por proxy interno, foge de ad-blockers)

---

## Pagamentos (Asaas)

O Asaas é o gateway de pagamentos brasileiro utilizado (Pix, boleto, cartão de crédito).

### Fluxo de assinatura
1. Usuário clica em "Assinar" → `/api/asaas/checkout` cria customer + subscription no Asaas
2. Asaas envia webhook para `/api/asaas/webhook` a cada evento de pagamento
3. Webhook valida token (`asaas-access-token`), identifica o plano pelo `externalReference` e atualiza `perfis_usuarios`
4. `getUserPlan()` lê o plano do perfil e aplica downgrade lazy quando `asaas_period_end` passa

### Eventos tratados no webhook
- `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED` → ativa plano
- `PAYMENT_OVERDUE` → marca plano como inadimplente (se implementado)
- `SUBSCRIPTION_DELETED` → agenda downgrade para Free na data de expiração

---

## Configuração local

### Pré-requisitos
- Node.js 20+
- Conta Supabase com projeto criado
- Conta Asaas (sandbox disponível)
- Conta Resend

```bash
# Clone e instale dependências
git clone <repo>
cd bloom-saas
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores

# Inicie o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

> **Importante:** usar apenas `npm run dev` (Turbopack). Nunca `--webpack`.

### Gerar VAPID keys

```bash
npx web-push generate-vapid-keys
```

---

## Variáveis de ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Nunca expor no client

# Push notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BJ...
VAPID_PRIVATE_KEY=xxxx

# Cron authorization
CRON_SECRET=string-aleatoria-segura

# E-mail transacional
RESEND_API_KEY=re_...

# Asaas (gateway de pagamentos)
ASAAS_API_KEY=aact_...
ASAAS_WEBHOOK_TOKEN=token-secreto
ASAAS_PRO_VALUE=29.00
ASAAS_PREMIUM_VALUE=59.00
```

---

## Deploy (Vercel)

```bash
# Deploy via CLI
npx vercel --prod

# Ou conecte o repositório no dashboard da Vercel
# e configure as variáveis de ambiente em Settings → Environment Variables
```

O `vercel.json` define 2 cron jobs (limite do plano Hobby). Para mais crons, migre para o plano Pro ou use pg_cron no Supabase.

---

## Queries de monitoramento

Ver seção [Banco de dados → Views de monitoramento](#banco-de-dados) acima. Todas as views estão salvas no Supabase e acessíveis pelo SQL Editor com `SELECT * FROM <nome>`.

---

## Sugestões de escalabilidade

### Curto prazo (0–500 usuários pagantes)

**1. Índices no banco**
As queries mais frequentes fazem `WHERE user_id = $1 AND ...`. Adicionar índices compostos nas tabelas de maior volume:
```sql
CREATE INDEX ON clientes      (user_id, status);
CREATE INDEX ON vendas        (user_id, status, data_venda DESC);
CREATE INDEX ON produtos      (user_id, ativo, estoque_atual);
CREATE INDEX ON notificacoes  (user_id, read, created_at DESC);
```

**2. Connection pooling com Supavisor**
Ativar o pooler do Supabase (`?pgbouncer=true` na string de conexão de server-side) para evitar esgotamento de conexões em picos de acesso — especialmente relevante com Server Actions em edge functions.

**3. Rate limiting nas API Routes**
As rotas `/api/asaas/*` e `/api/export` não têm proteção contra abuso. Adicionar rate limiting com Upstash Rate Limit (Redis) ou o middleware de rate limit da Vercel.

**4. Busca com `pg_trgm`**
A busca de clientes e produtos usa `ILIKE '%termo%'`, que não aproveita índices. Com `pg_trgm` é possível criar um índice GIN e melhorar de forma substancial para bases com muitos registros:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX ON clientes USING GIN (nome gin_trgm_ops);
```

---

### Médio prazo (500–5.000 usuários)

**5. Migrar crons para pg_cron + Supabase Edge Functions**
O plano Hobby da Vercel limita a 2 crons. Mover a lógica para Edge Functions acionadas por `pg_cron` elimina o limite e reduz latência (roda próximo ao banco):
```sql
SELECT cron.schedule('birthday-cron', '0 8 * * *', $$
  SELECT net.http_post(url := 'https://jgubosjuamljbfwvurvr.supabase.co/functions/v1/birthday')
$$);
```

**6. Exportação assíncrona (background job)**
A exportação CSV hoje é síncrona e pode exceder o timeout de 10s da Vercel em contas com muitos dados. Alternativa: enfileirar o job, gerar o arquivo no Supabase Storage e enviar um link por e-mail quando pronto.

**7. Cache de leitura para o dashboard**
O dashboard agrega dados de várias tabelas a cada acesso. Adicionar um `materialized view` no Postgres atualizado periodicamente (ou com trigger após `INSERT/UPDATE` em `vendas`) elimina as queries de agregação ao vivo.

**8. Separar plano de leitura no Supabase**
Configurar uma `replica` de leitura no Supabase para separar queries analíticas (relatórios, dashboard) das transacionais (pedidos, estoque) — disponível nos planos Pro do Supabase.

---

### Longo prazo (5.000+ usuários / times)

**9. Multi-tenancy com organizações**
Hoje o modelo é 1 usuário = 1 conta. Para suportar times (ex.: uma supervisora com 3 revendedoras):
- Adicionar tabela `organizacoes` e `membros_organizacao`
- Mudar o isolamento de `user_id` para `org_id` nas tabelas principais
- Criar roles: `owner`, `admin`, `viewer`
- Adicionar feature gate `multiUser` no plano Premium

**10. Filas para notificações push em massa**
Enviar push para milhares de subscriptions de forma síncrona em um cron vai timeout. Usar um worker assíncrono (Trigger.dev, Inngest ou BullMQ + Redis) para enfileirar e enviar em batches com retry automático para subscriptions expiradas.

**11. Observabilidade**
- **Erros**: Sentry (SDK para Next.js) para capturar exceções de runtime com contexto do usuário
- **Analytics de produto**: PostHog ou Mixpanel para entender onde usuários travam no onboarding, quais features mais usam e taxa de ativação do trial
- **Métricas de infra**: Vercel Analytics + Supabase Dashboard para latência de queries e edge cache hit rate

**12. Separação de domínios (microserviços leve)**
Se a codebase crescer muito, separar em:
- `app-web`: Next.js atual (UI + Server Actions)
- `api-notifications`: serviço dedicado para push/e-mail (Node.js + fila)
- `api-payments`: webhook handler do Asaas isolado para facilitar auditoria

**13. App nativo (PWA → híbrido)**
O PWA funciona bem para instalação, mas notificações push no iOS têm restrições. Usar Capacitor para empacotar o app Next.js existente em um app iOS/Android nativo com acesso à API de notificações nativa — sem reescrever a UI.
