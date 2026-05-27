import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Target, Sparkles, ArrowRight, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a história do Bloom: o CRM criado por e para revendedoras de cosméticos que queriam organizar o negócio com elegância.",
  openGraph: {
    title: "Sobre o Bloom",
    description:
      "Conheça a história do Bloom: o CRM criado por e para revendedoras de cosméticos.",
  },
};

const values = [
  {
    icon: Heart,
    title: "Feito com carinho",
    desc: "Cada funcionalidade foi pensada junto com revendedoras reais. Nada aqui é genérico — é do jeito que vocês precisam.",
  },
  {
    icon: Target,
    title: "Foco no essencial",
    desc: "Sem complexidade desnecessária. A plataforma deve ser uma aliada, não mais uma coisa para aprender.",
  },
  {
    icon: Sparkles,
    title: "Design que inspira",
    desc: "Trabalhar com beleza merece uma ferramenta bonita. O design minimalista não é vaidade — é respeito pelo seu tempo.",
  },
];

const stats: { value: string; label: string; icon?: typeof Star }[] = [
  { value: "1.200+", label: "Revendedoras ativas" },
  { value: "48 mil", label: "Clientes gerenciados" },
  { value: "R$ 2,4M", label: "Em vendas registradas" },
  { value: "4,9", label: "Avaliação média", icon: Star },
];

const team = [
  {
    name: "Fernanda Oliveira",
    role: "Co-fundadora & CEO",
    bio: "Ex-revendedora Avon por 8 anos. Criou o Bloom depois de perder clientes por falta de organização.",
    initials: "FO",
  },
  {
    name: "Lucas Carvalho",
    role: "Co-fundador & CTO",
    bio: "Engenheiro de software com experiência em produtos SaaS. Acredita que tecnologia boa é tecnologia invisível.",
    initials: "LC",
  },
  {
    name: "Bianca Matos",
    role: "Produto & Design",
    bio: "UX designer especializada em produtos para pequenos negócios. Filha de revendedora Natura.",
    initials: "BM",
  },
];

const testimonials = [
  {
    name: "Ana Clara S.",
    role: "Revendedora Mary Kay · SP",
    text: "Antes eu anotava tudo no caderno e esquecia de ligar. Agora a agenda do Bloom me avisa tudo. Minhas vendas subiram 40% em 3 meses.",
    stars: 5,
  },
  {
    name: "Juliana P.",
    role: "Revendedora Avon · MG",
    text: "A parte de pedidos é incrível. Consigo ver tudo o que está pendente de entrega e nunca mais esqueci nenhum. Minhas clientes adoram a organização.",
    stars: 5,
  },
  {
    name: "Patrícia R.",
    role: "Revendedora Natura · RJ",
    text: "Simples de usar, bonito e funciona no celular. Exatamente o que eu precisava. O suporte respondeu minha dúvida em menos de 2 horas.",
    stars: 5,
  },
];

export default function SobrePage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-rose-100 mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          Nossa história
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
          Criado por quem entende o negócio de beleza
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
          O Bloom nasceu de uma frustração real. Nossa co-fundadora Fernanda
          passou anos como revendedora de cosméticos, anotando clientes em
          caderno, pedidos em papel e follow-ups na cabeça — e perdendo vendas
          por causa disso. Quando ela pediu ao Lucas para criar uma ferramenta
          simples de usar, o Bloom surgiu.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-rose-500 rounded-3xl p-6 sm:p-8 text-white mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-200 mb-3">
          Nossa missão
        </p>
        <p className="text-xl sm:text-2xl font-bold leading-snug mb-4">
          Dar às revendedoras de cosméticos a mesma organização que grandes
          empresas têm — de forma simples, bonita e acessível.
        </p>
        <p className="text-sm text-rose-100 leading-relaxed">
          Acreditamos que toda revendedora merece uma ferramenta profissional,
          não mais uma planilha complicada ou um caderno perdido. O Bloom é para
          quem ama o que faz e quer crescer com tranquilidade.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700"
            >
              <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 inline-flex items-center gap-1.5">
                {s.value}
                {Icon && (
                  <Icon className="w-5 h-5 fill-amber-400 text-amber-400" />
                )}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-5">
          O que guia o nosso trabalho
        </h2>
        <div className="space-y-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="flex items-start gap-4 p-5 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm"
            >
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                <v.icon className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mb-1">
                  {v.title}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
          Quem faz o Bloom
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
          Um time pequeno, focado e apaixonado pelo produto.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="p-5 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm text-center"
            >
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-base font-bold text-rose-600">
                  {member.initials}
                </span>
              </div>
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                {member.name}
              </p>
              <p className="text-xs text-rose-500 font-medium mb-2">
                {member.role}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-5">
          O que as revendedoras dizem
        </h2>
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-5 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                &quot;{t.text}&quot;
              </p>
              <div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  {t.name}
                </p>
                <p className="text-xs text-neutral-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 sm:p-8 bg-neutral-900 rounded-3xl text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Pronta para experimentar?
        </h3>
        <p className="text-sm text-neutral-400 mb-6">
          Comece grátis hoje. Sem cartão de crédito, sem complicação.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-600 transition-colors text-sm"
          >
            Criar conta grátis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm"
          >
            Ver planos
          </Link>
        </div>
      </div>
    </div>
  );
}
