"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, RefreshCw, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY: Record<string, { label: string; bg: string; text: string }> = {
  price:       { label: "Prix",        bg: "bg-red-50",     text: "text-red-600" },
  budget:      { label: "Budget",      bg: "bg-orange-50",  text: "text-orange-600" },
  stall:       { label: "Temporise",   bg: "bg-yellow-50",  text: "text-yellow-700" },
  timing:      { label: "Timing",      bg: "bg-blue-50",    text: "text-blue-600" },
  competition: { label: "Concurrents", bg: "bg-purple-50",  text: "text-purple-600" },
  doubt:       { label: "Doute",       bg: "bg-stone-100",  text: "text-stone-600" },
  third_party: { label: "Tiers",       bg: "bg-pink-50",    text: "text-pink-600" },
};

type Objection = {
  id: string;
  order: number;
  label: string;
  category: string;
  trigger_phrases: string[] | null;
  applicable_step_orders: number[] | null;
  responses: string[] | null;
  key_reframe: string | null;
};

export function ObjectionCard({ objection }: { objection: Objection }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY[objection.category] ?? { label: objection.category, bg: "bg-stone-100", text: "text-stone-600" };

  return (
    <div className={cn(
      "border rounded-xl bg-white transition-all overflow-hidden",
      expanded ? "border-stone-300 shadow-sm" : "border-stone-200 hover:border-stone-300"
    )}>
      <button
        className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={cn(
          "text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 leading-none",
          cat.bg, cat.text
        )}>
          {cat.label}
        </span>
        <p className="flex-1 font-medium text-[13px] text-stone-800 text-left leading-tight min-w-0 truncate">
          "{objection.label}"
        </p>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-stone-100 pt-3">
          {objection.trigger_phrases && objection.trigger_phrases.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Le prospect dit
              </p>
              <div className="flex flex-wrap gap-1.5">
                {objection.trigger_phrases.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal text-rose-500 border-rose-200">
                    "{p}"
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {objection.key_reframe && (
            <section className="space-y-1.5">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Retournement
              </p>
              <p className="text-[13px] font-medium text-stone-800 bg-stone-50 rounded-lg px-3 py-2.5 leading-relaxed">
                {objection.key_reframe}
              </p>
            </section>
          )}

          {objection.responses && objection.responses.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Réponses
              </p>
              <ol className="space-y-2">
                {objection.responses.map((r, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-[11px] flex items-center justify-center font-semibold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-stone-700 leading-relaxed">{r}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
