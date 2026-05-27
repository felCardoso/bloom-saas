# @AGENTS.md

## Bloom — SaaS CRM para revendedoras de cosméticos

## Stack

- **Next.js 16.2.6** — App Router, Turbopack (padrão). **Nunca usar `--webpack`**.
- **React 19**, **TypeScript 5.9**, **Tailwind v4** (CSS variables, sem tailwind.config de classes)
- **Supabase** — auth, banco, Realtime. Project ID: `jgubosjuamljbfwvurvr`
- **web-push 3.6.7** — push notifications via VAPID. Declarado em `serverExternalPackages` no `next.config.ts`
- **date-fns v4**, **lucide-react**, **recharts**

## Branch de desenvolvimento

Sempre trabalhar em: **`claude/integrate-supabase-auth-GcJFu`**
Nunca fazer push direto para `main` sem permissão explícita.

## Regras críticas de build

1. **`"use client"`** é obrigatório em qualquer arquivo com `onClick`, `useState`, `useEffect`, `window`, ou qualquer handler de evento — incluindo `app/~offline/page.tsx` (já causou build failures múltiplas vezes).
2. **`web-push`** deve estar em `package.json` dependencies E em `serverExternalPackages: ["web-push"]` no `next.config.ts`. Sem isso o Turbopack não resolve o módulo.
3. Server Actions: `"use server"` no topo, retornam `{ error?: string }`, chamam `revalidatePath()`.
4. Nunca usar `next build --webpack` — usar só `next build`.

## Arquitetura de arquivos relevantes

```text
app/
  (dashboard)/
    clientes/view.tsx        # CRUD clientes com modal detalhe/editar/excluir
    pedidos/view.tsx         # CRUD pedidos com delete
    agenda/_client.tsx       # CRUD eventos com editar
    produtos/view.tsx        # CRUD produtos com modal
    configuracoes/_client.tsx # Configurações + push subscription toggle
    pricing/page.tsx         # Página de planos
  api/
    asaas/                   # Checkout, portal, webhook (gateway de pagamento BR)
    cron/
      birthday/route.ts      # Cron diário 08:00 — aniversários
      daily/route.ts         # Cron diário 09:00 — pedidos pendentes + estoque baixo
      stock/route.ts         # (legado, não usado no vercel.json)
      pending-orders/route.ts # (legado, não usado no vercel.json)
  ~offline/page.tsx          # DEVE ter "use client" (onClick no botão)

lib/
  actions/
    clientes.ts              # getClientes, addCliente, updateCliente, deleteCliente
    vendas.ts                # getVendas, addVenda (decrementa estoque), updateVendaStatus, deleteVenda
    agenda.ts                # getEventos, addEvento, updateEvento, deleteEvento
    produtos.ts              # getProdutos, addProduto, updateProduto, deleteProduto
    notificacoes.ts          # getNotificacoes, markAsRead, markAllAsRead
    push.ts                  # savePushSubscription, deletePushSubscription
    profile.ts               # getProfile, updateProfile, getNotificationPrefs, updateNotificationPrefs
    relatorios.ts            # dados para relatórios
    dashboard.ts             # dados do dashboard
    auth.ts                  # login, logout
  push.ts                    # sendPushNotification (web-push VAPID utility)
  plans.ts                   # definição dos planos (free/pro/premium) e feature gates
  plan-context.tsx           # usePlan() — planId, plan, canAdd(), hasFeature()
  theme-context.tsx          # useTheme() — light/dark + primaryColor
  supabase/
    client.ts                # createBrowserClient (client-side)
    server.ts                # createServerClient (server-side, cookies)
  utils.ts                   # cn(), formatCurrency(), formatDate(), formatPhone()
  types.ts                   # Client, Order, Product, Evento, etc.
  email.ts                   # sendOrderConfirmationEmail (Resend)

components/
  NotificationBell.tsx       # Bell com badge, dropdown, Supabase Realtime
  PwaUpdateBanner.tsx        # Banner de atualização do PWA
  layout/
    Header.tsx               # Usa <NotificationBell /> (não mais bell estático)
    Sidebar.tsx
    BottomNav.tsx
  ui/                        # Button, Modal, Input, Select, Card, Badge, Avatar, etc.

public/
  sw.js                      # Service worker estático (cache + push handler)

vercel.json                  # 2 cron jobs (limite Hobby): birthday 08:00, daily 09:00
next.config.ts               # serverExternalPackages: ["web-push"] + headers para sw.js
```

## Banco de dados (Supabase)

Tabelas principais:

- `perfis_usuarios` — id (= auth.uid), plano, preferencias_notificacoes (JSONB), asaas_customer_id, etc.
- `clientes` — user_id, nome, telefone, email, bairro_cidade, status, observacoes, data_nascimento (aniversario)
- `vendas` — user_id, cliente_id, valor_total, status, data_venda
- `itens_venda` — venda_id, produto_id, quantidade, preco_unitario_no_momento
- `produtos` — user_id, nome, marca, categoria, preco_custo, preco_venda, estoque_atual, ativo
- `eventos_agenda` — user_id, client_name, type, title, description, date
- `notificacoes` — user_id, type (birthday/low_stock/pending_order), title, body, read, data (JSONB)
- `push_subscriptions` — user_id, subscription (JSONB). Unique index em `(user_id, (subscription->>'endpoint'))`

## Variáveis de ambiente necessárias

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # usado nos cron jobs
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
CRON_SECRET                      # Bearer token que a Vercel envia nos cron requests
RESEND_API_KEY                   # email transacional
ASAAS_API_KEY
ASAAS_WEBHOOK_TOKEN
ASAAS_PRO_VALUE
ASAAS_PREMIUM_VALUE
```

## Sistema de planos

`lib/plans.ts` define 3 planos: `free`, `pro`, `premium`.
Feature gates relevantes:

- `birthdayReminders`: false (free), true (pro/premium)
- `stockAlerts`: false (free), true (pro/premium)
- `whatsappLink`: false (free), true (pro/premium)
- `csvExport`: false (free/pro), true (premium)
- `advancedReports`: false (free/pro), true (premium)

## Sistema de notificações (implementado)

- **In-app**: tabela `notificacoes` + `NotificationBell.tsx` com Supabase Realtime
- **Push**: SW `push` event handler em `public/sw.js` + VAPID via `lib/push.ts`
- **Toggle push**: em Configurações → Notificações, converte VAPID key com `urlBase64ToUint8Array()` antes de passar para `pushManager.subscribe()` (passar string direto falha silenciosamente)
- **Crons**: birthday (aniversários amanhã), daily (pedidos pendentes 7+ dias + estoque ≤ 5 unidades)
- Para testar manualmente: `curl -H "Authorization: Bearer $CRON_SECRET" https://dominio.vercel.app/api/cron/birthday`
- Para habilitar Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE notificacoes;`

## Padrões de código

- Cor primária: sempre `rose-*` (Tailwind v4 remapeia via CSS variables para a cor escolhida no tema)
- Dark mode: classes `dark:` em todos os elementos
- Mobile-first: componentes pensados para 375px, desktop é progressivo
- Modais de confirmação de exclusão: mostrar erro se FK constraint impedir (ex: cliente com pedidos)
- Após ações de escrita: chamar `revalidatePath()` no server action + `router.refresh()` no client

## Problemas recorrentes (não repetir)

1. `~offline/page.tsx` sem `"use client"` → build quebra sempre
2. `web-push` sem `serverExternalPackages` → Turbopack não resolve
3. `applicationServerKey` como string → push silenciosamente falha; usar `urlBase64ToUint8Array()`
4. `deleteCliente` sem checar erro → cliente "some" da UI mas volta no refresh
5. `addVenda` sem decrementar estoque → estoque não atualiza (já corrigido)
