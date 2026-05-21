"use client";

import { useState } from "react";
import { MessageSquarePlus, Send, Check, Bug, Sparkles, Heart, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitFeedback, type FeedbackItem, type FeedbackType } from "@/lib/actions/feedback";
import { formatDate } from "@/lib/utils";

const TYPE_OPTIONS: { value: FeedbackType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "bug", label: "Bug", icon: Bug, desc: "Algo não está funcionando" },
  { value: "melhoria", label: "Melhoria", icon: Sparkles, desc: "Sugestão de nova feature" },
  { value: "elogio", label: "Elogio", icon: Heart, desc: "Compartilhe o que gostou" },
  { value: "outro", label: "Outro", icon: HelpCircle, desc: "Qualquer outra mensagem" },
];

const TYPE_BADGE: Record<FeedbackType, string> = {
  bug: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  melhoria: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
  elogio: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
  outro: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  melhoria: "Melhoria",
  elogio: "Elogio",
  outro: "Outro",
};

export default function FeedbackClient({ initialFeedbacks }: { initialFeedbacks: FeedbackItem[] }) {
  const [type, setType] = useState<FeedbackType>("melhoria");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await submitFeedback({ type, subject, body });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    const newItem: FeedbackItem = {
      id: crypto.randomUUID(),
      type,
      subject,
      body,
      created_at: new Date().toISOString(),
    };
    setFeedbacks((prev) => [newItem, ...prev]);
    setSubject("");
    setBody("");
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Form card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Enviar feedback</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Sua opinião nos ajuda a melhorar o Bloom.</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4 shrink-0" />
            Feedback enviado! Obrigada pela sua mensagem.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type picker */}
          <div>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">Tipo</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                    type === value
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                      : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600",
                  )}
                >
                  <Icon className={cn("w-4 h-4", type === value ? "text-rose-500" : "text-neutral-400 dark:text-neutral-500")} />
                  <span className={cn("text-xs font-semibold", type === value ? "text-rose-600 dark:text-rose-400" : "text-neutral-600 dark:text-neutral-400")}>
                    {label}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-tight hidden sm:block">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Assunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setError(""); }}
              placeholder="Resumo em uma frase..."
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">
              Mensagem
              <span className="float-right font-normal text-neutral-400">{body.length}/2000</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setError(""); }}
              placeholder="Descreva com detalhes..."
              rows={5}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="submit"
              disabled={loading || !subject.trim() || !body.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar
            </button>
          </div>
        </form>
      </div>

      {/* Previous feedbacks */}
      {feedbacks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-3">Seus feedbacks anteriores</h3>
          <div className="space-y-3">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5", TYPE_BADGE[item.type])}>
                    {TYPE_LABELS[item.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">{item.subject}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{item.body}</p>
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
