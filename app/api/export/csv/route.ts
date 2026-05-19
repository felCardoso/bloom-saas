import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

function csvEscape(value: string): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  return "﻿" + lines.join("\r\n"); // BOM for Excel UTF-8 compatibility
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  if (type === "clientes") {
    const { data, error } = await supabase
      .from("clientes")
      .select("nome, telefone, email, bairro_cidade, status, observacoes, data_nascimento")
      .eq("user_id", user.id)
      .order("nome");

    if (error) return new NextResponse("Internal Server Error", { status: 500 });

    const rows = ((data ?? []) as any[]).map((r) => [
      csvEscape(r.nome),
      csvEscape(r.telefone ?? ""),
      csvEscape(r.email ?? ""),
      csvEscape(r.bairro_cidade ?? ""),
      csvEscape(r.status ?? "ativa"),
      csvEscape(r.observacoes ?? ""),
      csvEscape(r.data_nascimento ?? ""),
    ]);

    const csv = buildCsv(
      ["Nome", "Telefone", "Email", "Cidade", "Status", "Observacoes", "Data de Nascimento"],
      rows
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="clientes.csv"',
      },
    });
  }

  if (type === "produtos") {
    const { data, error } = await supabase
      .from("produtos")
      .select("nome, marca, categoria, preco_custo, preco_venda, estoque_atual")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .order("nome");

    if (error) return new NextResponse("Internal Server Error", { status: 500 });

    const rows = ((data ?? []) as any[]).map((r) => [
      csvEscape(r.nome),
      csvEscape(r.marca ?? ""),
      csvEscape(r.categoria ?? ""),
      csvEscape(String(r.preco_custo ?? 0)),
      csvEscape(String(r.preco_venda ?? 0)),
      csvEscape(String(r.estoque_atual ?? 0)),
    ]);

    const csv = buildCsv(
      ["Nome", "Marca", "Categoria", "Preco de Custo", "Preco de Venda", "Estoque"],
      rows
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="produtos.csv"',
      },
    });
  }

  if (type === "pedidos") {
    const { data, error } = await supabase
      .from("vendas")
      .select(
        "data_venda, status, valor_total, clientes(nome), itens_venda(quantidade, preco_unitario_no_momento, produtos(nome))"
      )
      .eq("user_id", user.id)
      .order("data_venda", { ascending: false });

    if (error) return new NextResponse("Internal Server Error", { status: 500 });

    const rows = ((data ?? []) as any[]).map((r) => {
      const itens = (r.itens_venda ?? [])
        .map((i: any) => `${i.produtos?.nome ?? "?"} x${i.quantidade}`)
        .join("; ");
      return [
        csvEscape(r.data_venda ?? ""),
        csvEscape(r.clientes?.nome ?? ""),
        csvEscape(r.status ?? ""),
        csvEscape(String(r.valor_total ?? 0)),
        csvEscape(itens),
      ];
    });

    const csv = buildCsv(["Data", "Cliente", "Status", "Total", "Produtos"], rows);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="pedidos.csv"',
      },
    });
  }

  return new NextResponse("Bad Request: type must be clientes, produtos or pedidos", {
    status: 400,
  });
}
