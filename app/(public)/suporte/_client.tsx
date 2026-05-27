"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  Search,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    category: "Conta e Planos",
    questions: [
      {
        q: "Como faço para mudar de plano?",
        a: "Acesse a página de Planos dentro do app pelo menu lateral. Você pode fazer upgrade imediatamente ou agendar o downgrade para o fim do período vigente. Alterações de plano são refletidas em tempo real.",
      },
      {
        q: "Posso cancelar a qualquer momento?",
        a: "Sim, sem fidelidade mínima. O cancelamento pode ser feito nas Configurações da conta. Após cancelar, sua assinatura continua ativa até o fim do período já pago e, então, a conta retorna automaticamente ao plano Grátis.",
      },
      {
        q: "Perco meus dados se fizer downgrade?",
        a: "Não. Todos os dados são mantidos. Se você tiver mais clientes do que o limite do novo plano, os dados ficam em modo leitura — você os visualiza, mas não pode adicionar novos até que o número esteja dentro do limite ou você faça upgrade novamente.",
      },
      {
        q: "Existe período de teste gratuito?",
        a: "Sim! O plano Plus tem 7 dias de teste gratuito, sem necessidade de cartão de crédito. Você pode experimentar todas as funcionalidades e cancelar antes do vencimento sem nenhum custo.",
      },
    ],
  },
  {
    category: "Clientes e Dados",
    questions: [
      {
        q: "Como importar minha lista de clientes?",
        a: "No momento, o cadastro é feito manualmente pelo formulário na página de Clientes. A importação via planilha CSV está prevista para a próxima versão. Se tiver uma lista grande, entre em contato pelo suporte que podemos auxiliar na migração.",
      },
      {
        q: "Os dados dos meus clientes são compartilhados?",
        a: "Nunca. Os dados dos seus clientes são exclusivamente seus. Não os acessamos, compartilhamos ou utilizamos para qualquer finalidade além de armazenar e exibir para você dentro da plataforma.",
      },
      {
        q: "Posso exportar meus dados?",
        a: "A exportação em CSV está disponível no plano Premium. Para os demais planos, você pode solicitar uma exportação completa dos seus dados pelo e-mail de suporte — atendemos em até 5 dias úteis.",
      },
    ],
  },
  {
    category: "Funcionalidades",
    questions: [
      {
        q: "Como funciona a agenda de follow-ups?",
        a: "Na página Agenda, você cria eventos vinculados a clientes com data, tipo (follow-up, entrega, aniversário ou outro) e descrição. O dashboard exibe os próximos eventos e você pode marcar como concluído com um toque.",
      },
      {
        q: "O link do WhatsApp abre direto no aplicativo?",
        a: "Sim. O link rápido para WhatsApp (disponível no plano Pro e Premium) abre uma conversa diretamente com o número cadastrado no perfil da cliente, usando o app instalado no celular ou a versão web.",
      },
      {
        q: "Como funciona o alerta de estoque baixo?",
        a: "Produtos com 5 ou menos unidades em estoque recebem um badge de alerta na página de Produtos (plano Pro e Premium). Você define a quantidade ao cadastrar ou editar o produto.",
      },
      {
        q: "É possível usar em mais de um dispositivo?",
        a: "Sim! O Bloom funciona em qualquer dispositivo com navegador — computador, tablet ou celular. O design é mobile-first, então a experiência no celular é completa.",
      },
    ],
  },
  {
    category: "Pagamento e Faturamento",
    questions: [
      {
        q: "Quais formas de pagamento são aceitas?",
        a: "Aceitamos cartões de crédito (Visa, Mastercard, Elo, Amex) e Pix. O pagamento é processado de forma segura pelo nosso parceiro de pagamentos.",
      },
      {
        q: "Recebo nota fiscal?",
        a: "Sim. A nota fiscal eletrônica (NF-e de serviço) é emitida automaticamente no fechamento de cada ciclo de cobrança e enviada para o e-mail cadastrado.",
      },
    ],
  },
];

const supportChannels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    desc: "Resposta rápida nos horários de atendimento",
    action: "Iniciar conversa",
    href: "https://wa.me/31986991278",
    plans: ["Premium"],
    color:
      "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    icon: Mail,
    title: "E-mail",
    desc: "Suporte técnico detalhado, todos os planos",
    action: "Enviar e-mail",
    href: "mailto:suporte@bloom.com.br",
    plans: ["Grátis", "Plus", "Premium"],
    color:
      "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
];

const slaTable = [
  {
    plan: "Grátis",
    channel: "Comunidade / E-mail",
    sla: "Melhor esforço",
    color: "text-neutral-500",
  },
  {
    plan: "Plus",
    channel: "E-mail",
    sla: "Resposta em até 48h",
    color: "text-blue-600",
  },
  {
    plan: "Premium",
    channel: "E-mail + WhatsApp",
    sla: "Resposta em até 24h",
    color: "text-rose-600",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 py-4 text-left group"
      >
        <span className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-rose-600 transition-colors">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed pb-4 -mt-1">
          {a}
        </p>
      )}
    </div>
  );
}

export default function SuporteClient({ isPremium }: { isPremium: boolean }) {
  const [search, setSearch] = useState("");

  const filteredFaq = faqItems
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (item) =>
          !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Central de Suporte
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Encontre respostas rápidas ou fale com nossa equipe.
        </p>
      </div>

      {/* Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {supportChannels.map((ch) => {
          const isWhatsApp = ch.title === "WhatsApp";
          const locked = isWhatsApp && !isPremium;
          const Tag = locked ? Link : "a";
          const linkProps = locked
            ? { href: "/pricing" }
            : {
                href: ch.href,
                target: ch.href.startsWith("http") ? "_blank" : undefined,
                rel: "noopener noreferrer",
              };
          return (
            <Tag
              key={ch.title}
              {...(linkProps as { href: string })}
              className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border hover:shadow-sm transition-all",
                ch.color,
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  ch.iconBg,
                )}
              >
                <ch.icon className={cn("w-5 h-5", ch.iconColor)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                    {ch.title}
                  </p>
                  <div className="flex gap-1">
                    {ch.plans.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] bg-white/70 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded-md font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {ch.desc}
                </p>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-2 underline inline-flex items-center gap-1">
                  {locked && <Lock className="w-3 h-3" />}
                  {locked ? "Disponível no Premium" : ch.action}
                  <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </Tag>
          );
        })}
      </div>

      {/* SLA table */}
      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-10">
        <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Tempo de resposta por plano
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Plano
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Canal
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                SLA
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {slaTable.map((row) => (
              <tr
                key={row.plan}
                className="hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <td className="px-5 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {row.plan}
                </td>
                <td className="px-5 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {row.channel}
                </td>
                <td className={cn("px-5 py-3 text-sm font-medium", row.color)}>
                  {row.sla}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 bg-neutral-100/50 dark:bg-neutral-800/40">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Horário de atendimento: seg–sex, 9h–18h (horário de Brasília).
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-1">
          Perguntas frequentes
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
          {faqItems.reduce((s, c) => s + c.questions.length, 0)} respostas para
          as dúvidas mais comuns.
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar nas perguntas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent shadow-sm"
          />
        </div>

        {filteredFaq.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-neutral-400 text-sm">
              Nenhuma pergunta encontrada para &quot;{search}&quot;
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFaq.map((cat) => (
              <div key={cat.category}>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 px-1">
                  {cat.category}
                </h3>
                <Card padding="none" className="px-5">
                  {cat.questions.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Still need help */}
      <div className="mt-10 p-5 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-xl flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-rose-500" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Não encontrou o que precisava?
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Nossa equipe responde em até 48h no e-mail.
          </p>
        </div>
        <a
          href="mailto:suporte@bloom.com.br"
          className="shrink-0 px-4 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors"
        >
          Enviar e-mail
        </a>
      </div>
    </div>
  );
}
