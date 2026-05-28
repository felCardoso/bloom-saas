-- Bloom — schema do banco (public)
-- Gerado em: 2026-05-28T20:36:20.459Z
-- Não edite à mão; rode `npm run db:dump` para regenerar.

-- ── Table: categorias_produto ─────────────────────────────────────────
CREATE TABLE "categorias_produto" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "nome" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "categorias_produto_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "categorias_produto_pkey" PRIMARY KEY (id),
  CONSTRAINT "categorias_produto_user_id_nome_key" UNIQUE (user_id, nome)
);

ALTER TABLE "categorias_produto" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own categories" ON "categorias_produto"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

-- ── Table: clientes ─────────────────────────────────────────
CREATE TABLE "clientes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "nome" text NOT NULL,
  "telefone" text,
  "data_nascimento" date,
  "bairro_cidade" text,
  "tags" text[] DEFAULT '{}'::text[],
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "email" text,
  "status" text DEFAULT 'ativa'::text,
  "observacoes" text,
  CONSTRAINT "clientes_status_check" CHECK ((status = ANY (ARRAY['ativa'::text, 'inativa'::text, 'prospect'::text]))),
  CONSTRAINT "clientes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  CONSTRAINT "clientes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem atualizar seus próprios clientes" ON "clientes"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Usuários podem deletar seus próprios clientes" ON "clientes"
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Usuários podem inserir seus próprios clientes" ON "clientes"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Usuários podem ver seus próprios clientes" ON "clientes"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.uid() = user_id));

-- ── Table: eventos_agenda ─────────────────────────────────────────
CREATE TABLE "eventos_agenda" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "client_name" text DEFAULT ''::text NOT NULL,
  "type" text DEFAULT 'outro'::text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "date" date NOT NULL,
  "completed" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "eventos_agenda_type_check" CHECK ((type = ANY (ARRAY['follow_up'::text, 'entrega'::text, 'aniversario'::text, 'outro'::text]))),
  CONSTRAINT "eventos_agenda_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "eventos_agenda_pkey" PRIMARY KEY (id)
);

ALTER TABLE "eventos_agenda" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_eventos" ON "eventos_agenda"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

-- ── Table: feedback ─────────────────────────────────────────
CREATE TABLE "feedback" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "type" text DEFAULT 'outro'::text NOT NULL,
  "subject" text NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "feedback_type_check" CHECK ((type = ANY (ARRAY['bug'::text, 'melhoria'::text, 'elogio'::text, 'outro'::text]))),
  CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "feedback_pkey" PRIMARY KEY (id)
);

ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback" ON "feedback"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users select own feedback" ON "feedback"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.uid() = user_id));

-- ── Table: itens_venda ─────────────────────────────────────────
CREATE TABLE "itens_venda" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "venda_id" uuid NOT NULL,
  "produto_id" uuid NOT NULL,
  "quantidade" integer DEFAULT 1 NOT NULL,
  "preco_unitario_no_momento" numeric NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "itens_venda_produto_id_fkey" FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
  CONSTRAINT "itens_venda_venda_id_fkey" FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
  CONSTRAINT "itens_venda_pkey" PRIMARY KEY (id)
);

ALTER TABLE "itens_venda" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem atualizar itens de suas vendas" ON "itens_venda"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM vendas
  WHERE ((vendas.id = itens_venda.venda_id) AND (vendas.user_id = auth.uid())))));
CREATE POLICY "Usuários podem deletar itens de suas vendas" ON "itens_venda"
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM vendas
  WHERE ((vendas.id = itens_venda.venda_id) AND (vendas.user_id = auth.uid())))));
CREATE POLICY "Usuários podem inserir itens em suas vendas" ON "itens_venda"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM vendas
  WHERE ((vendas.id = itens_venda.venda_id) AND (vendas.user_id = auth.uid())))));
CREATE POLICY "Usuários podem ver os itens de suas vendas" ON "itens_venda"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM vendas
  WHERE ((vendas.id = itens_venda.venda_id) AND (vendas.user_id = auth.uid())))));

-- ── Table: modelos_mensagens ─────────────────────────────────────────
CREATE TABLE "modelos_mensagens" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "titulo" text NOT NULL,
  "descricao" text,
  "conteudo" text NOT NULL,
  "icone" text DEFAULT 'Sparkles'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "modelos_mensagens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  CONSTRAINT "modelos_mensagens_pkey" PRIMARY KEY (id)
);

ALTER TABLE "modelos_mensagens" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios modelos" ON "modelos_mensagens"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id));

-- ── Table: movimentacoes_estoque ─────────────────────────────────────────
CREATE TABLE "movimentacoes_estoque" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "produto_id" uuid NOT NULL,
  "tipo" text NOT NULL,
  "quantidade" integer NOT NULL,
  "motivo" text,
  "venda_id" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "movimentacoes_estoque_produto_id_fkey" FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
  CONSTRAINT "movimentacoes_estoque_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "movimentacoes_estoque_venda_id_fkey" FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE SET NULL,
  CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY (id)
);

ALTER TABLE "movimentacoes_estoque" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own movements" ON "movimentacoes_estoque"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

-- ── Table: notificacoes ─────────────────────────────────────────
CREATE TABLE "notificacoes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "read" boolean DEFAULT false NOT NULL,
  "data" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "notificacoes_type_check" CHECK ((type = ANY (ARRAY['birthday'::text, 'low_stock'::text, 'pending_order'::text]))),
  CONSTRAINT "notificacoes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "notificacoes_pkey" PRIMARY KEY (id)
);

ALTER TABLE "notificacoes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON "notificacoes"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id));

-- ── Table: perfis_usuarios ─────────────────────────────────────────
CREATE TABLE "perfis_usuarios" (
  "id" uuid NOT NULL,
  "nome_completo" text,
  "email" text,
  "avatar_url" text,
  "plano" text DEFAULT 'free'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "telefone" text,
  "nome_marca" text,
  "preferencias_notificacoes" jsonb DEFAULT '{"push": false, "birthdays": false, "newsletter": false, "stockAlerts": false, "pendingOrders": true}'::jsonb,
  "onboarding_completo" boolean DEFAULT false,
  "asaas_customer_id" text,
  "asaas_subscription_id" text,
  "asaas_period_end" date,
  "cpf_cnpj" text,
  "trial_ends_at" timestamp with time zone,
  "trial_claimed" boolean DEFAULT false NOT NULL,
  "pending_plan" text,
  CONSTRAINT "perfis_usuarios_plano_check" CHECK ((plano = ANY (ARRAY['free'::text, 'pro'::text, 'premium'::text]))),
  CONSTRAINT "perfis_usuarios_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "perfis_usuarios_pkey" PRIMARY KEY (id)
);

ALTER TABLE "perfis_usuarios" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON "perfis_usuarios"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((auth.uid() = id));
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON "perfis_usuarios"
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = id));
CREATE POLICY "Usuários podem criar seus próprios perfis" ON "perfis_usuarios"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = id));
CREATE POLICY "Usuários podem inserir seu próprio perfil" ON "perfis_usuarios"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = id));
CREATE POLICY "Usuários podem ver seu próprio perfil" ON "perfis_usuarios"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.uid() = id));
CREATE POLICY "Usuários podem ver seus próprios perfis" ON "perfis_usuarios"
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = id));

-- ── Table: produtos ─────────────────────────────────────────
CREATE TABLE "produtos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "nome" text NOT NULL,
  "imagem_url" text,
  "categoria" text,
  "preco_custo" numeric DEFAULT 0,
  "preco_venda" numeric DEFAULT 0,
  "estoque_atual" integer DEFAULT 0,
  "estoque_minimo" integer DEFAULT 0,
  "tags" text[] DEFAULT '{}'::text[],
  "ativo" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "marca" text,
  CONSTRAINT "produtos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  CONSTRAINT "produtos_pkey" PRIMARY KEY (id)
);

ALTER TABLE "produtos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gerenciamento total de produtos pelo dono" ON "produtos"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Usuários podem atualizar seus próprios produtos" ON "produtos"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Usuários podem deletar seus próprios produtos" ON "produtos"
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Usuários podem inserir seus próprios produtos" ON "produtos"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Usuários podem ver seus próprios produtos" ON "produtos"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.uid() = user_id));

-- ── Table: push_subscriptions ─────────────────────────────────────────
CREATE TABLE "push_subscriptions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "subscription" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY (id)
);

ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions" ON "push_subscriptions"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id));

-- ── Table: templates_whatsapp ─────────────────────────────────────────
CREATE TABLE "templates_whatsapp" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "nome" text NOT NULL,
  "tipo" text DEFAULT 'personalizado'::text NOT NULL,
  "mensagem" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "templates_whatsapp_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "templates_whatsapp_pkey" PRIMARY KEY (id)
);

ALTER TABLE "templates_whatsapp" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own templates" ON "templates_whatsapp"
  AS PERMISSIVE
  FOR ALL
  TO public
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

-- ── Table: trial_blocklist ─────────────────────────────────────────
CREATE TABLE "trial_blocklist" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "email_hash" text NOT NULL,
  "cpf_hash" text,
  "blocked_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "trial_blocklist_pkey" PRIMARY KEY (id),
  CONSTRAINT "trial_blocklist_cpf_hash_key" UNIQUE (cpf_hash),
  CONSTRAINT "trial_blocklist_email_hash_key" UNIQUE (email_hash)
);

ALTER TABLE "trial_blocklist" ENABLE ROW LEVEL SECURITY;

-- ── Table: vendas ─────────────────────────────────────────
CREATE TABLE "vendas" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "cliente_id" uuid NOT NULL,
  "data_venda" timestamp with time zone DEFAULT now(),
  "valor_total" numeric(15, 2) DEFAULT 0,
  "forma_pagamento" text,
  "esta_pago" boolean DEFAULT true,
  "status" text DEFAULT 'pendente'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "payment_method" text DEFAULT 'dinheiro'::text NOT NULL,
  "paid_at" timestamp with time zone,
  CONSTRAINT "vendas_forma_pagamento_check" CHECK ((forma_pagamento = ANY (ARRAY['pix'::text, 'cartão'::text, 'dinheiro'::text, 'outro'::text]))),
  CONSTRAINT "vendas_status_check" CHECK ((status = ANY (ARRAY['pendente'::text, 'confirmado'::text, 'entregue'::text, 'cancelado'::text]))),
  CONSTRAINT "vendas_cliente_id_fkey" FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  CONSTRAINT "vendas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  CONSTRAINT "vendas_pkey" PRIMARY KEY (id)
);

ALTER TABLE "vendas" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem atualizar suas próprias vendas" ON "vendas"
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Usuários podem deletar suas próprias vendas" ON "vendas"
  AS PERMISSIVE
  FOR DELETE
  TO public
  USING ((auth.uid() = user_id));
CREATE POLICY "Usuários podem gerenciar suas próprias vendas" ON "vendas"
  AS PERMISSIVE
  FOR ALL
  TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Usuários podem inserir suas próprias vendas" ON "vendas"
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Usuários podem ver suas próprias vendas" ON "vendas"
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((auth.uid() = user_id));

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX notificacoes_user_id_idx ON public.notificacoes USING btree (user_id);
CREATE UNIQUE INDEX perfis_usuarios_stripe_customer_id_idx ON public.perfis_usuarios USING btree (asaas_customer_id) WHERE (asaas_customer_id IS NOT NULL);
CREATE INDEX idx_produtos_user_categoria ON public.produtos USING btree (user_id, categoria);
CREATE UNIQUE INDEX push_subscriptions_user_endpoint_idx ON public.push_subscriptions USING btree (user_id, ((subscription ->> 'endpoint'::text)));
CREATE INDEX idx_vendas_user_data ON public.vendas USING btree (user_id, data_venda DESC);

-- ── GRANTs (Supabase roles) ───────────────────────────────────
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "categorias_produto" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "categorias_produto" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "categorias_produto" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "clientes" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "clientes" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "clientes" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "eventos_agenda" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "eventos_agenda" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "eventos_agenda" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "feedback" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "feedback" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "feedback" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "itens_venda" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "itens_venda" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "itens_venda" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "modelos_mensagens" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "modelos_mensagens" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "modelos_mensagens" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "movimentacoes_estoque" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "movimentacoes_estoque" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "movimentacoes_estoque" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "notificacoes" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "notificacoes" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "notificacoes" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "perfis_usuarios" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "perfis_usuarios" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "perfis_usuarios" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "produtos" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "produtos" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "produtos" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "push_subscriptions" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "push_subscriptions" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "push_subscriptions" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "templates_whatsapp" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "templates_whatsapp" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "templates_whatsapp" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "trial_blocklist" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "trial_blocklist" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "trial_blocklist" TO service_role;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "vendas" TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "vendas" TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "vendas" TO service_role;
