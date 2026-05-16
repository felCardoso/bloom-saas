import type { Metadata } from "next";
import { Sparkles, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Bloom",
};

const testimonial = {
  text: "Antes eu perdia clientes por falta de organização. Com o Bloom, minhas vendas subiram 40% em 3 meses.",
  name: "Ana Clara S.",
  role: "Revendedora Mary Kay · SP",
};

const stats = [
  { value: "1.200+", label: "Revendedoras" },
  { value: "4,9 ★", label: "Avaliação" },
  { value: "R$ 2,4M", label: "Em vendas" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-neutral-950">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-110 xl:w-125 shrink-0 bg-linear-to-br from-rose-500 to-rose-600 flex-col p-10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-auto">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Bloom
          </span>
        </div>

        {/* Center content */}
        <div className="relative py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-200 mb-3">
            Para revendedoras de cosméticos
          </p>
          <h2 className="text-2xl xl:text-3xl font-bold text-white leading-snug mb-4">
            Organize seu negócio de beleza com elegância
          </h2>
          <p className="text-sm text-rose-100 leading-relaxed">
            Clientes, pedidos, produtos e agenda em um único lugar. Simples,
            bonito e feito para você crescer.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-3 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-sm"
            >
              <p className="text-base font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-rose-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="relative bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-300 text-amber-300" />
            ))}
          </div>
          <p className="text-sm text-white leading-relaxed mb-3">
            &quot;{testimonial.text}&quot;
          </p>
          <div>
            <p className="text-xs font-semibold text-white">
              {testimonial.name}
            </p>
            <p className="text-[11px] text-rose-200">{testimonial.role}</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto bg-white dark:bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
