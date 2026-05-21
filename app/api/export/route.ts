import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

type Row = Record<string, string | number>;
type Format = "csv" | "xlsx";

function csvEscape(value: string | number): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv(headers: string[], rows: Row[]): string {
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h] ?? "")).join(",")),
  ];
  return "﻿" + lines.join("\r\n"); // BOM for Excel UTF-8 compatibility
}

function buildXlsx(headers: string[], rows: Row[]): Buffer {
  const aoa: (string | number)[][] = [
    headers,
    ...rows.map((r) => headers.map((h) => r[h] ?? "")),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Dados");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function respond(format: Format, filename: string, headers: string[], rows: Row[]): NextResponse {
  if (format === "xlsx") {
    const buffer = buildXlsx(headers, rows);
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }
  return new NextResponse(buildCsv(headers, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: perfil } = await supabase
    .from("perfis_usuarios")
    .select("plano")
    .eq("id", user.id)
    .single();

  const planId = (perfil?.plano ?? "free") as PlanId;
  if (!PLANS[planId]?.features?.csvExport) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const type = request.nextUrl.searchParams.get("type");
  const formatParam = request.nextUrl.searchParams.get("format");
  const format: Format = formatParam === "xlsx" ? "xlsx" : "csv";

  if (type === "clientes") {
    const { data, error } = await supabase
      .from("clientes")
      .select("nome, telefone, email, bairro_cidade, status, observacoes, data_nascimento")
      .eq("user_id", user.id)
      .order("nome");

    if (error) return new NextResponse("Internal Server Error", { status: 500 });

    const headers = ["Nome", "Telefone", "Email", "Cidade", "Status", "Observacoes", "Data de Nascimento"];
    const rows: Row[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      Nome: String(r.nome ?? ""),
      Telefone: String(r.telefone ?? ""),
      Email: String(r.email ?? ""),
      Cidade: String(r.bairro_cidade ?? ""),
      Status: String(r.status ?? "ativa"),
      Observacoes: String(r.observacoes ?? ""),
      "Data de Nascimento": String(r.data_nascimento ?? ""),
    }));

    return respond(format, "clientes", headers, rows);
  }

  if (type === "produtos") {
    const { data, error } = await supabase
      .from("produtos")
      .select("nome, marca, categoria, preco_custo, preco_venda, estoque_atual")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .order("nome");

    if (error) return new NextResponse("Internal Server Error", { status: 500 });

    const headers = ["Nome", "Marca", "Categoria", "Preco de Custo", "Preco de Venda", "Estoque"];
    const rows: Row[] = ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      Nome: String(r.nome ?? ""),
      Marca: String(r.marca ?? ""),
      Categoria: String(r.categoria ?? ""),
      "Preco de Custo": Number(r.preco_custo ?? 0),
      "Preco de Venda": Number(r.preco_venda ?? 0),
      Estoque: Number(r.estoque_atual ?? 0),
    }));

    return respond(format, "produtos", headers, rows);
  }

  if (type === "pedidos") {
    const { data, error } = await supabase
      .from("vendas")
      .select(
        "data_venda, status, valor_total, payment_method, paid_at, clientes(nome), itens_venda(quantidade, preco_unitario_no_momento, produtos(nome))",
      )
      .eq("user_id", user.id)
      .order("data_venda", { ascending: false });

    if (error) return new NextResponse("Internal Server Error", { status: 500 });

    const headers = ["Data", "Cliente", "Status", "Pagamento", "Pago em", "Total", "Produtos"];
    const rows: Row[] = ((data ?? []) as Record<string, unknown>[]).map((r) => {
      const itens = ((r.itens_venda ?? []) as Record<string, unknown>[])
        .map((i) => {
          const prod = i.produtos as { nome?: string } | null;
          return `${prod?.nome ?? "?"} x${i.quantidade}`;
        })
        .join("; ");
      const cliente = r.clientes as { nome?: string } | null;
      return {
        Data: String(r.data_venda ?? ""),
        Cliente: String(cliente?.nome ?? ""),
        Status: String(r.status ?? ""),
        Pagamento: String(r.payment_method ?? ""),
        "Pago em": String(r.paid_at ?? ""),
        Total: Number(r.valor_total ?? 0),
        Produtos: itens,
      };
    });

    return respond(format, "pedidos", headers, rows);
  }

  return new NextResponse("Bad Request: type must be clientes, produtos or pedidos", {
    status: 400,
  });
}
