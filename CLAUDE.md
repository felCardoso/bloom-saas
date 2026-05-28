# Bloom — Design System (contexto para Claude Code)

> Cole este arquivo no chat do Claude Code antes de pedir mudanças, **ou** salve como `CLAUDE.md` na raiz de `bloom-saas` para que ele seja lido automaticamente em toda sessão. É a fonte canônica de marca, tokens e padrões de UI. Quando houver divergência entre este documento e o código, **este documento ganha** — atualize o código.

---

## 0. Como usar este prompt

Você é um(a) engenheiro(a) frontend trabalhando no **Bloom**, um CRM SaaS mobile-first (PWA) para revendedoras de cosméticos no Brasil. Stack: **Next.js 16 (App Router) + Supabase + Tailwind v4 + TypeScript + lucide-react**.

Ao receber qualquer task de UI:

1. **Leia este arquivo inteiro antes de tocar em qualquer componente.**
2. Cheque se já existe um componente em `components/ui/` que cobre o caso. Se sim, **use-o**, não recrie.
3. Cheque se há um token em `app/globals.css` / `tailwind.config.ts` que cobre o valor que você ia hardcodar. Use o token.
4. Antes de adicionar dependência nova ou ícone fora de `lucide-react`, **pare e pergunte**.
5. Toda string visível ao usuário é em **português brasileiro**, gênero feminino quando se referir à pessoa usuária.

Quando estiver inseguro sobre comportamento (RLS, gating de plano, validação, side-effects), abra os arquivos canônicos antes de escrever código:

- `app/globals.css` — tokens reais (CSS vars + `@theme`)
- `tailwind.config.ts` — mapping de classes
- `lib/plans.ts` — limites e features por plano (**Free / Plus / Premium**)
- `lib/utils.ts` — `cn()`, `formatCurrency()`, `formatDate()`, `formatPhone()`, `getInitials()`
- `components/ui/*` — primitives
- `components/layout/*` — Header, Sidebar, BottomNav

---

## 1. Produto em uma página

Bloom resolve a operação inteira de uma revendedora em um app só:

| Módulo | O que faz |
| --- | --- |
| **Dashboard** | KPIs de receita, pedidos, clientes ativos, top produtos |
| **Clientes** | CRUD com histórico de compras, aniversários, status |
| **Pedidos** | Status, pagamento, baixa automática de estoque |
| **Produtos** | Catálogo, estoque, custo, margem, histórico |
| **Agenda** | Follow-ups, entregas, eventos, aniversários |
| **Mensagens** | Templates de WhatsApp personalizáveis (Plus+) |
| **Relatórios** | Receita, categorias, ranking de clientes (Plus+) |
| **Notificações** | In-app (Realtime) + push (PWA / VAPID) |

**Planos**:
- **Free** — até 30 clientes
- **Plus** — R$ 29/mês, até 200 clientes, relatórios básicos
- **Premium** — R$ 59/mês, ilimitado, exportação CSV

Novos usuários ganham **trial de 7 dias do Plus**. Nunca hardcode limites — sempre via `lib/plans.ts`.

Audiência: ~95% mulheres, dona do próprio negócio, faixa 25–55, mobile-first (a maioria nunca abre o app no desktop).

---

## 2. Voz, tom e copy (não-negociáveis)

- **Idioma**: pt-BR sempre. Nada de inglês na UI do produto.
- **Pessoa**: você (formal-amigável). Nunca tu, nunca senhora.
- **Gênero**: feminino quando se referir à pessoa usuária — "Bem-**vinda** de volta", "para revendedo**ras**", "Você está conectada".
- **Tom**: caloroso, encorajador, profissional sem ser corporativo. Fala _com_ ela como colega organizadora — não infantiliza, não vende em excesso, não usa "querida", "amiga", "linda".
- **Verbos no imperativo informal**: "Adicione sua primeira cliente", "Cadastre um produto", "Entre na sua conta".

### Casing

| Tipo | Regra | Exemplo |
| --- | --- | --- |
| Botão / CTA | Title case curto | "Entrar", "Criar conta grátis", "Adicionar cliente" |
| Título de página | Capitalização normal | "Dashboard", "Pedidos Recentes" |
| Eyebrow micro | UPPERCASE + `letter-spacing: 0.1em` | `PASSO 1`, `RECOMENDADO`, `CLIENTES` |
| Status badge | Capitalização normal | "Pendente", "Entregue", "Cancelado" |

### Comprimento

- Subtítulo cabe em 1 linha em mobile (≈ 60 chars).
- Helper de campo: 5–8 palavras.
- Erro: 1 frase com ação clara — `"Informe um telefone com 10 ou 11 dígitos."`

### Números, moeda, datas, telefones

- Moeda: `R$ 2.480,00` (pt-BR, ponto de milhar, vírgula decimal) via `formatCurrency()`
- Data curta: `12/03/2025` (`dd/MM/yyyy`) via `formatDate()`
- Telefone: `(11) 98765-4321` via `formatPhone()`
- Em UI, número financeiro usa **JetBrains Mono** com `font-variant-numeric: tabular-nums` — classe `mono-numeric` ou `font-mono tabular-nums`.

### Proibido na UI

- ❌ **Emoji** em qualquer lugar — onboarding, empty states, toasts, push, tudo. Sem `🌸 ✨ 🎉`.
- ❌ **Unicode como ícone** — `★ ✓ → •` etc. Exceção única: lucide `Star` com `fill` em reviews.
- ❌ "Querida", "amiga", "linda", diminutivos infantis ("clientinha", "vendinha").
- ❌ Anglicismos quando há equivalente natural — diga "pedido" não "order", "cliente" não "lead".

### Exemplos canônicos (copie a vibe)

> "Bem-vinda de volta" · "Entre na sua conta para continuar."
> "Organize seu negócio de beleza com elegância" · "Clientes, pedidos, produtos e agenda em um único lugar."
> "Adicione sua primeira cliente" · "Cadastre nome, telefone e aniversário para nunca perder o contato."
> "Não foi possível excluir: este cliente possui pedidos vinculados."

---

## 3. Cor

### Brand primary — Rose

`#D4829C` (dusty-rose, levemente dessaturado vs Tailwind stock). Calmo, "boutique cosmetic", **nunca berrante**.

```
--rose-50:  #FDF2F6
--rose-100: #FAE6EE
--rose-200: #F5CCE0
--rose-300: #EDA8C8
--rose-400: #E07AAA
--rose-500: #D4829C  ← brand
--rose-600: #C4687F
--rose-700: #A85C78
--rose-800: #8C4D65
--rose-900: #6B3A4D
```

### Neutrals (cool grays, Tailwind-aligned)

```
50  #FAFAFA   ← app canvas
100 #F5F5F5
200 #E5E7EB   ← border default
300 #D1D5DB
400 #9CA3AF   ← placeholder, fg-subtle
500 #6B7280   ← fg-muted
600 #4B5563
700 #374151
800 #1F2937   ← fg
900 #111827
950 #0A0A0C
```

### Semantic

| Função | 50 | 500 | 700 |
| --- | --- | --- | --- |
| Sucesso (entregue, pago) | `#ECFDF5` | `#10B981` emerald | `#047857` |
| Warning (pendente) | `#FFFBEB` | `#F59E0B` amber | `#B45309` |
| Danger (cancelado) | `#FEF2F2` | `#EF4444` red | `#B91C1C` |
| Info (confirmado) | `#EFF6FF` | `#3B82F6` blue | `#1D4ED8` |
| Premium accent | `#F5F3FF` | `#8B5CF6` violet | — |

### Surface (light)

```
--bg:           #FAFAFA   app canvas
--bg-elevated:  #FFFFFF   cards, modals, sidebar
--bg-muted:     #F5F5F5   search input, soft fills
--fg:           #1F2937   body text
--fg-muted:     #6B7280   secondary
--fg-subtle:    #9CA3AF   helper, placeholder
--border:       #E5E7EB
--border-subtle:#F5F5F5
```

### Surface (dark)

```
--bg:           #0F0F11
--bg-elevated:  #18181B
--bg-muted:     #1F1F23
--fg:           #F1F1F3
--fg-muted:     #A1A1AA
--fg-subtle:    #71717A
--border:       #27272A
--border-subtle:#1F1F23
```

### Tema configurável

A "cor primária" do app é trocável pela usuária entre **rose (default), violet, blue, teal, amber**. Implementado via atributo `data-primary` em `<html>`, que faz override das vars `--rose-*`. **Todas as classes Tailwind continuam usando `rose-*`** — o token é que resolve para a paleta escolhida. Mantenha esse contrato: nunca hardcode `#D4829C`, sempre `var(--rose-500)` ou `bg-rose-500`.

### Gradientes

Sempre lineares, `135deg`, **dois stops adjacentes no scale** (ex.: `linear-gradient(135deg, #D4829C, #C4687F)`). Nunca multi-color, nunca radial, nunca rainbow.

### Hover / press / focus

- Hover (botão primário): `rose-500 → rose-600`. Press: `→ rose-700`.
- Hover (botão secundário): borda `neutral-200 → neutral-300`.
- Hover (row clicável, card): bg `neutral-50`.
- Hover (icon button): bg `neutral-100`.
- Focus: `ring-2 ring-rose-400 ring-offset-2`, sempre `:focus-visible`. Nunca `outline`.
- Disabled: `opacity-50 cursor-not-allowed`.

---

## 4. Tipografia

**Geist** para toda a UI (9 weights + italics, servida localmente). **JetBrains Mono** (400/500/600) só para dado numérico: preços, SKUs, IDs, datas em tabela, telefones, e tokens em docs.

> ⚠️ O codebase em produção ainda usa Inter via `next/font/google`. A marca é Geist — se você está mexendo em layout/font, **troque para Geist em `app/layout.tsx`** quando estiver tocando ali. Caso contrário, deixe para um PR dedicado.

```
--font-sans: 'Geist', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
```

### Escala (px)

```
2xs  10   nav micro-label, chip meta
xs   12   helper, badges, captions
sm   14   body default, controls, buttons
base 16   read size
lg   18
xl   20   page H2
2xl  24   page H1, stat values
3xl  28   auth headline
```

### Pesos

```
regular  400   body
medium   500   default UI
semibold 600   buttons, títulos
bold     700   hero, stat values
extra    800
```

### Line-height

```
tight    1.20   heads
snug     1.35   UI
normal   1.50   body
relaxed  1.65   long-form
```

### Letter-spacing

- Hero / stat: `-0.01` a `-0.02em`
- Eyebrow caps: `+0.1em`

### Classes semânticas (use estas)

`.h1` `.h2` `.h3` `.page-title` `.page-subtitle` `.eyebrow` `.body` `.body-muted` `.caption` `.stat-value` `.label-form` `.mono-numeric` `.code`

Use as classes semânticas antes de cair em utilitários Tailwind crus — elas refletem decisões já tomadas.

---

## 5. Espaçamento, radius, sombra

### Escala (Tailwind-aligned, px)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

Mobile-first. Tudo é desenhado para **375px** primeiro; desktop é progressive enhancement.

### Layout

```
--sidebar-w:     240px   fixa à esquerda em desktop
--header-h:      56px    mobile, sticky
--header-h-lg:   64px    lg+
--bottom-nav-h:  64px    mobile, fixed, respeita safe-area-inset-bottom (.safe-bottom)
--max-content:   1200px
```

### Border-radius

| Token | Valor | Onde |
| --- | --- | --- |
| `sm` | 6px | tags pequenas |
| `md` | 8px | inputs compactos |
| `lg` | 12px | **botões, inputs** |
| `xl` / `2xl` | 16px | **cards, modais centrados, tiles** (workhorse) |
| `3xl` | 24px | hero cards, top-edge do bottom-sheet |
| `pill` | 9999px | badges, avatars, drag handles, dot indicators |

**Nada quadrado em superfície tactile.**

### Shadow (whisper-soft, nunca harsh)

```
card:     0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
soft:     0 2px 8px rgba(0,0,0,0.06)
elevated: 0 4px 16px rgba(0,0,0,0.10)
focus:    0 0 0 2px var(--rose-400), 0 0 0 4px #FFFFFF
```

---

## 6. Motion

Conservadora. **Sem bounces, sem overshoots.**

```
--dur-fast:   150ms   transições padrão (cor, bg, border)
--dur-base:   200ms   modal centered, dropdown, toast — ease-out
--dur-sheet:  280ms   bottom-sheet mobile — ease-standard (curva iOS)

--ease-out:      cubic-bezier(0, 0, 0.2, 1)
--ease-standard: cubic-bezier(0.32, 0.72, 0, 1)
```

- Skeleton/loader: spinner circular (sem shimmer).
- `prefers-reduced-motion`: respeite — reduza durações a 0.

---

## 7. Iconografia (regra rígida)

**Sistema único: [`lucide-react`](https://lucide.dev)** (já é dependência).

- **Stroke-width**: `2` (default). Nunca `1.5`, nunca `2.5`. Nunca misture.
- **Tamanhos canônicos**: 14, 16, 18, 20, 24. Mais usados: 16/18 na chrome, 14 em chips, 20 em nav.
- **Cor**: herda `currentColor`. Ativos: `rose-500`. Inativos: `neutral-400/500`.
- **Iconbox**: container 36–40px quadrado, `radius 10–12px`, bg tonal (`rose-50` + `rose-500` icon, `emerald-50` + `emerald-500` icon, etc.).
- **Lockup**: ícone à esquerda, `gap: 8px` (compacto) ou `12px` (listas).

### Inventário canônico

`LayoutDashboard` `Users` `ShoppingBag` `Package` `Calendar` `MessageCircle` `BarChart3` `Settings` `Zap` (upgrade) `Bell` `Search` `Plus` `Pencil` `Trash2` `Check` `CheckCircle2` `AlertTriangle` `X` `ArrowRight` `ChevronDown` `Eye/EyeOff` `LogOut` `Sparkles` (welcome) `Star` `TrendingUp/Down` `MoreHorizontal` `DollarSign` `Clock`.

Se precisar de algo fora dessa lista, escolha um lucide existente — **não importe outra biblioteca, não desenhe SVG custom** (exceção única: o logo).

---

## 8. Componentes — quando usar o quê

| Necessidade | Use |
| --- | --- |
| Surface (sidebar, card, modal, toast) | `bg-elevated` + `border-subtle` + `shadow-card` |
| App canvas | `bg` (`#FAFAFA`) |
| Ação primária | `<Button variant="primary">` — rose-500, texto branco |
| Ação secundária | `<Button variant="secondary">` — bg branco, texto neutral-700, border neutral-200 |
| Ação destrutiva | `<Button variant="danger">` — red-500, texto branco |
| Status | `<Badge tone="...">` — rose / blue / amber / emerald / red / neutral |
| Status text inline | `text-{semantic}-700` sobre `bg-{semantic}-50` |
| Valor numérico | `font-mono tabular-nums tracking-tight` (classe `mono-numeric`) |
| Helper / placeholder | `text-xs text-neutral-400/500` |
| Eyebrow | `.eyebrow` (2xs · bold · uppercase · tracking-wider · neutral-400) |

### Primitives prontos em `components/ui/`

`Avatar` `Badge` `Button` `Card` `Input` `Select` `Modal` `Toast` `Skeleton` `Pagination` `ThemeToggle` `LockedFeature` `UpgradeModal` `UsageBanner`

**Não recrie**. Estenda via props ou crie um wrapper se precisar de uma variação.

### Card

```
bg:       #FFFFFF (light) / #18181B (dark)
border:   1px solid #E5E7EB (light) / #27272A (dark)   ← sempre, mesmo com shadow
radius:   16px
shadow:   card
padding:  16px (sm) · 20px (md, default) · 24px (lg)
```

### Lista (clientes / pedidos / produtos)

- Full-width até `max-content`.
- **Sem zebra** — use `divide-y divide-neutral-100`.
- Row clicável: hover bg `neutral-50`, transition `dur-fast`.
- Avatar de iniciais (determinístico via `getInitials()`) quando não houver foto.

### Modal

- **Mobile**: bottom-sheet — desliza de baixo, drag-handle no topo (pill `neutral-300` 36×4px), top-radius `3xl`, dur `280ms` com `--ease-standard`.
- **Desktop**: centralizado, radius `xl`, dur `200ms` com `--ease-out`.
- Overlay: `bg-black/30 backdrop-blur-sm`.

### KPI grid

- 2 colunas em mobile, 4 em desktop (`lg:grid-cols-4`).
- `<StatCard>` já existe em `components/dashboard/StatCard.tsx`.

### Layout shell

- **Sticky header** em todas as views do dashboard.
- **Fixed bottom-nav** em mobile (sempre visível durante scroll, `.safe-bottom`).
- **Sidebar** fixa em desktop a partir de `lg:`.
- Conteúdo `max-w-[1200px]`, cards full-width até o constraint.

### Backgrounds e ornamentos

- **Sem padrões repetitivos, sem texturas, sem hand-drawn.** Brand é **chromatic**, não decorativo.
- Único ornamento permitido: **3 círculos brancos translúcidos** (`rgba(255,255,255,0.05–0.10)`) em superfície brand (auth hero, onboarding banner) — referência sutil ao logo lotus.
- Imagens em-app: fotos reais de clientes/produtos, recortadas em retângulo ou círculo, sem filtros. Fallback: avatar de iniciais colorido determinístico.

### Transparência e blur

- `backdrop-blur-sm` (4px) em overlay de modal e "stamps" sobre brand.
- `bg-white/10..20` em chips dentro de hero panel brand.
- **Nunca em superfície normal** — não é um design frosted-glass.

---

## 9. Gating de plano (lib/plans.ts)

**Toda feature gated** roteia por `lib/plans.ts`. Padrão visual:

- Feature bloqueada renderiza `<LockedFeature>` ou `<UpgradeModal>` em vez do conteúdo.
- Banner de uso (`<UsageBanner>`) aparece em 80% do limite com tom amber, e em 100% com tom rose (CTA para upgrade).
- Badge "Plus" / "Premium" em itens de nav usa `bg-violet-50 text-violet-700` com ícone `Zap` (Plus) ou `Sparkles` (Premium).
- Nunca hardcode "30 clientes", "200 clientes" — sempre leia de `lib/plans.ts`.

---

## 10. Acessibilidade — mínimo aceitável

- Hit target mobile: **≥ 44×44px**.
- Todo input tem `<label>` associado (htmlFor) ou `aria-label`.
- Estado de loading anuncia via `aria-busy` ou `role="status"`.
- Contraste mínimo AA: corpo 4.5:1, UI grande 3:1. `neutral-400` sobre `#FFFFFF` falha — só use em texto **decorativo** (helper, eyebrow), nunca em label essencial.
- Focus-ring sempre visível em teclado (`:focus-visible`).
- `prefers-reduced-motion: reduce` → durações 0.

---

## 11. Padrões de código (Next 16 + Tailwind v4)

- Server Components por padrão; `'use client'` só quando precisar de hook/handler.
- Forms: Server Actions sempre que possível; cliente só para validação inline e UX.
- Data: leia via Supabase RSC; mutate via Server Action com `revalidatePath`.
- Tailwind v4: tokens via `@theme` em `app/globals.css`. **Não** crie um `tailwind.config` paralelo para coisas que já existem como var.
- Componentes em PascalCase, arquivos `.tsx`. Co-locate helpers como `Component.tsx` + `Component.types.ts` se a complexidade pedir.
- `cn()` de `lib/utils.ts` para mesclar classes — nunca `clsx` direto, nunca concat manual com `&&`.
- Datas: `date-fns` (já no projeto), locale `pt-BR`.

---

## 12. Checklist antes de abrir PR

- [ ] Toda string em pt-BR, gênero feminino quando se refere à usuária.
- [ ] Zero emoji na UI. Zero unicode como ícone.
- [ ] Todo ícone vem de `lucide-react`, stroke 2, tamanho canônico.
- [ ] Cor vem de token CSS ou classe Tailwind `rose-*` / `neutral-*` / semântica — **nenhum hex hardcoded**.
- [ ] Número financeiro em `font-mono tabular-nums`.
- [ ] Hit target mobile ≥ 44px.
- [ ] Componente reusa o que existe em `components/ui/` — não recriou Button/Card/Modal/Input.
- [ ] Funciona em **375px** (iPhone SE) sem overflow horizontal.
- [ ] Funciona em dark mode (testou `data-theme="dark"` ou classe `.dark`).
- [ ] Estado vazio, loading e erro têm tratamento explícito.
- [ ] `prefers-reduced-motion` respeitado se adicionou animação.

---

## 13. O que pedir antes de assumir

Sempre que a task for ambígua, **pergunte** antes de codar:

- Esta tela é mobile-only, desktop-only ou ambos? (Default: ambos.)
- É uma feature gated? Qual plano mínimo?
- Estado vazio: o que mostrar? (Title + sub + CTA + ícone iconbox?)
- Existe um similar em outra tela que devo seguir como referência?
- Loading skeleton ou spinner?
- Esta cópia veio de produto ou eu preciso escrever?

---

## 14. Estado atual (atualizado 27/05/2026)

### Design system — progresso de alinhamento ao spec

Histórico recente de PRs mergeados em sequência pra alinhar o código ao spec deste documento:

- **PR #40** Lote 1 — higiene cirúrgica: emoji/unicode removidos da UI, `cn()` em vez de template literals, hex hardcoded da landing trocado por classes Tailwind.
- **PR #41** Lote 2 — fonte Inter → Geist via `next/font/google` (auto-hospedada).
- **PR #42** Lote 4a — novo primitive `<SearchInput>` em `components/ui/`, aplicado em clientes/produtos/pedidos/suporte.
- **PR #43** Lote 4b — `<Select>` primitive ganhou `wrapperClassName` e `SelectOption.disabled`; aplicado em 4 filtros + picker de produto.
- **PR #44** Lote 4c+4d — `<Input type="password">` agora auto-renderiza toggle do olhinho; `<Button>` aplicado em todos os submits de auth + error pages.
- **PR #45** Lote 4e — `<Card>` aplicado em sobre + suporte. **Nota**: em dark mode, cards mudam de `bg-neutral-800` pra `bg-neutral-900` (hierarquia surface elevated do spec).
- **PR #46** Lote 4f — 1 input em configurações migrado pra `<Input>` (escopo reduzido por questão de fidelidade visual nos outros).
- **PR #47** Fixes do code review do #44 — Button esconde children durante loading, error/offline buttons preservam tamanho, Input toggle respeita `disabled`.

### Primitives disponíveis em `components/ui/`

Atuais: `Avatar`, `AvatarUpload`, `Badge`, `Button`, `Card`, `CookieBanner`, `Input` (com toggle eye pra password), `LockedFeature`, `Modal`, `Pagination`, `Select` (com `disabled` opcional), `Skeleton`, `SearchInput`, `ThemeToggle`, `Toast`, `UpgradeModal`, `UsageBanner`.

### Cores principais — implementação

`lib/theme-context.tsx` expõe `useTheme()` com `primaryColor` e `setPrimaryColor`. Picker já existe em `configuracoes/_client.tsx` (`AparenciaTab`, linhas 957-1014). As 5 palettes (rose/violet/blue/teal/amber) estão definidas em `app/globals.css` via `:root[data-primary="..."]` overrides das vars `--color-rose-*`.

Comportamento atual:
- Aplica `data-primary` em `<html>` só em rotas dashboard (landing/auth/public ficam rose).
- Persiste em `localStorage` (`bloom-primary`, `bloom-theme`).
- **Limitação conhecida**: FOUC (flash of unstyled content) — script de hidratação ainda não foi injetado em `<head>`, então usuárias que escolheram violet/dark veem flash de rose/light no primeiro paint antes do React hidratar e reler o localStorage.

### Roadmap pra fechar 100%

Inputs especiais em configurações ainda usam markup cru (esperado refactor pra extensões do primitive):
- L1107: senha com toggle eye — agora dá pra refatorar (Input password landed em #44).
- L1312: confirmação de e-mail destrutiva — precisa de `Input tone="danger"` (border + ring red, sem bg).
- L1425: edit inline de categoria — precisa de `Input size="sm"`.
- L751: CPF com border-rose-200 — precisa de wrapper tonal ou Input variant.

Mensagens (`mensagens/_client.tsx` linhas 44, 48) ainda têm emoji em templates de WhatsApp — conteúdo enviado pela usuária, não UI. Decisão de produto se remover ou não.

`lib/email.ts` tem 🌸 no subject e `→`/`✓` no HTML. Medium diferente — decisão à parte.

`termos/page.tsx` e `privacidade/page.tsx` usam `•` dentro de strings com `whitespace-pre-line`. Refatorar exige reestruturar o modelo de dados das seções.

### Convenção de branches

PRs nessa sessão seguiram `claude/<descritivo>` (ex.: `claude/search-input`, `claude/filter-selects`, `claude/auth-primitives`). Sem prefixo de issue. PRs pequenos e focados, um sub-lote por PR.

---

**Fim do contexto. Use-o como verdade canônica para qualquer alteração no Bloom.**
