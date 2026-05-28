// Dump simplificado do schema `public` do Supabase pra supabase/schema.sql.
//
// Por que não pg_dump? Supabase CLI requer Docker, e o pg_dump nativo não
// vem no Windows por padrão. Esta script usa só o cliente `pg` em JS para
// extrair as DDLs essenciais via queries em pg_catalog / information_schema.
//
// Cobertura:
// - CREATE TYPE … AS ENUM (tipos enumerados)
// - CREATE TABLE com colunas, tipos, defaults, nullable, IDENTITY/SERIAL
// - PRIMARY KEY + UNIQUE constraints
// - FOREIGN KEY constraints
// - CHECK constraints
// - CREATE INDEX (excluindo os implícitos de PK/UNIQUE)
// - Políticas RLS (CREATE POLICY) + ALTER TABLE … ENABLE ROW LEVEL SECURITY
// - GRANTs para roles do Supabase (anon, authenticated, service_role)
//
// Limitações conhecidas:
// - Não inclui funções/triggers/views (o app não usa nenhuma; cron jobs
//   rodam em Server Actions, não em pg_cron)
// - Não inclui dados (intencional)
// - Não inclui schemas auth/storage/realtime (gerenciados pelo Supabase)
// - Não cobre extensions (precisam ser habilitadas via dashboard)
//
// Uso:
//   $env:SUPABASE_DB_URL = "postgresql://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres"
//   npm run db:dump
//
// O arquivo de saída é supabase/schema.sql (rastreado no git).

import { writeFile } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(
    "Erro: defina SUPABASE_DB_URL antes de rodar.\n" +
      "Encontre em: Supabase Dashboard → Project Settings → Database → Connection string",
  );
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const out = [];
out.push("-- Bloom — schema do banco (public)");
out.push(`-- Gerado em: ${new Date().toISOString()}`);
out.push("-- Não edite à mão; rode `npm run db:dump` para regenerar.");
out.push("");

// ── ENUMs ────────────────────────────────────────────────────────────────────
const enums = await client.query(`
  SELECT n.nspname AS schema, t.typname AS name,
         array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
  GROUP BY n.nspname, t.typname
  ORDER BY t.typname
`);

if (enums.rows.length > 0) {
  out.push("-- ── ENUMs ─────────────────────────────────────────────────────");
  for (const row of enums.rows) {
    const labels = row.labels.map((l) => `'${l.replace(/'/g, "''")}'`).join(", ");
    out.push(`CREATE TYPE ${row.name} AS ENUM (${labels});`);
  }
  out.push("");
}

// ── Tabelas ──────────────────────────────────────────────────────────────────
const tables = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name
`);

const tableNames = tables.rows.map((r) => r.table_name);

for (const tableName of tableNames) {
  // Colunas
  const cols = await client.query(
    `
    SELECT column_name, data_type, udt_name, is_nullable, column_default,
           character_maximum_length, numeric_precision, numeric_scale,
           is_identity, identity_generation
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `,
    [tableName],
  );

  const colDefs = cols.rows.map((c) => {
    let type = c.data_type;
    if (type === "USER-DEFINED") type = c.udt_name;
    else if (type === "character varying" && c.character_maximum_length)
      type = `varchar(${c.character_maximum_length})`;
    else if (type === "numeric" && c.numeric_precision)
      type = `numeric(${c.numeric_precision}${c.numeric_scale ? `, ${c.numeric_scale}` : ""})`;
    else if (type === "ARRAY") type = `${c.udt_name.replace(/^_/, "")}[]`;

    const parts = [`  "${c.column_name}"`, type];
    if (c.is_identity === "YES") parts.push(`GENERATED ${c.identity_generation} AS IDENTITY`);
    if (c.column_default && c.is_identity !== "YES") parts.push(`DEFAULT ${c.column_default}`);
    if (c.is_nullable === "NO") parts.push("NOT NULL");
    return parts.join(" ");
  });

  // Constraints (PK, UNIQUE, FK, CHECK)
  const constraints = await client.query(
    `
    SELECT con.conname AS name, con.contype AS type,
           pg_get_constraintdef(con.oid) AS def
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE n.nspname = 'public' AND rel.relname = $1
    ORDER BY con.contype, con.conname
  `,
    [tableName],
  );

  const constraintDefs = constraints.rows.map(
    (c) => `  CONSTRAINT "${c.name}" ${c.def}`,
  );

  const allParts = [...colDefs, ...constraintDefs];

  out.push(`-- ── Table: ${tableName} ─────────────────────────────────────────`);
  out.push(`CREATE TABLE "${tableName}" (`);
  out.push(allParts.join(",\n"));
  out.push(");");
  out.push("");

  // RLS
  const rls = await client.query(
    `
    SELECT relrowsecurity, relforcerowsecurity
    FROM pg_class
    WHERE relname = $1 AND relnamespace = 'public'::regnamespace
  `,
    [tableName],
  );

  if (rls.rows[0]?.relrowsecurity) {
    out.push(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`);
    if (rls.rows[0].relforcerowsecurity) {
      out.push(`ALTER TABLE "${tableName}" FORCE ROW LEVEL SECURITY;`);
    }
    out.push("");
  }

  // Políticas RLS
  const policies = await client.query(
    `
    SELECT policyname AS name, cmd, roles, qual, with_check, permissive
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = $1
    ORDER BY policyname
  `,
    [tableName],
  );

  for (const p of policies.rows) {
    const parts = [`CREATE POLICY "${p.name}" ON "${tableName}"`];
    parts.push(`  AS ${p.permissive ? "PERMISSIVE" : "RESTRICTIVE"}`);
    parts.push(`  FOR ${p.cmd}`);
    // pg_policies.roles vem como name[] mas o driver pode entregar como string
    // ("{anon,authenticated}") em vez de array — normaliza para array.
    const roles = Array.isArray(p.roles)
      ? p.roles
      : typeof p.roles === "string"
        ? p.roles.replace(/^\{|\}$/g, "").split(",").filter(Boolean)
        : [];
    if (roles.length > 0) {
      parts.push(`  TO ${roles.join(", ")}`);
    }
    if (p.qual) parts.push(`  USING (${p.qual})`);
    if (p.with_check) parts.push(`  WITH CHECK (${p.with_check})`);
    out.push(parts.join("\n") + ";");
  }
  if (policies.rows.length > 0) out.push("");
}

// ── Índices (excluindo os implícitos de PK/UNIQUE) ───────────────────────────
const indexes = await client.query(`
  SELECT indexname AS name, tablename, indexdef
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname NOT IN (
      SELECT conname FROM pg_constraint WHERE contype IN ('p', 'u')
    )
  ORDER BY tablename, indexname
`);

if (indexes.rows.length > 0) {
  out.push("-- ── Índices ───────────────────────────────────────────────────");
  for (const idx of indexes.rows) {
    out.push(`${idx.indexdef};`);
  }
  out.push("");
}

// ── GRANTs para roles do Supabase ────────────────────────────────────────────
const grants = await client.query(`
  SELECT g.grantee, g.table_name,
         string_agg(DISTINCT g.privilege_type, ', ' ORDER BY g.privilege_type) AS privs
  FROM information_schema.role_table_grants g
  JOIN information_schema.tables t
    ON t.table_schema = g.table_schema AND t.table_name = g.table_name
  WHERE g.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND g.grantee IN ('anon', 'authenticated', 'service_role')
  GROUP BY g.grantee, g.table_name
  ORDER BY g.table_name, g.grantee
`);

if (grants.rows.length > 0) {
  out.push("-- ── GRANTs (Supabase roles) ───────────────────────────────────");
  for (const g of grants.rows) {
    out.push(`GRANT ${g.privs} ON TABLE "${g.table_name}" TO ${g.grantee};`);
  }
  out.push("");
}

await client.end();

await writeFile("supabase/schema.sql", out.join("\n"), "utf8");
console.log(
  `OK — supabase/schema.sql gerado (${tableNames.length} tabelas, ${enums.rows.length} enums, ${indexes.rows.length} índices).`,
);
