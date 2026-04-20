"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Target, Lightbulb, MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  order: number;
  name: string;
  goal: string | null;
  duration_estimate_minutes: number | null;
  key_phrases: string[] | null;
  questions: string[] | null;
  script_lines: string[] | null;
  tips: string[] | null;
};

export function StepCard({ step }: { step: Step }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "border rounded-xl bg-white transition-all overflow-hidden",
      expanded ? "border-stone-300 shadow-sm" : "border-stone-200 hover:border-stone-300"
    )}>
      <button
        className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center leading-none">
          {step.order}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[13.5px] text-stone-900 leading-tight">{step.name}</p>
          {step.goal && !expanded && (
            <p className="text-xs text-stone-400 mt-0.5 truncate">{step.goal}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {step.duration_estimate_minutes && (
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {step.duration_estimate_minutes}m
            </span>
          )}
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-stone-100 pt-3">
          {step.goal && (
            <p className="text-sm text-stone-500 italic">{step.goal}</p>
          )}

          {step.script_lines && step.script_lines.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> À dire
              </p>
              <ul className="space-y-1.5">
                {step.script_lines.map((line, i) => (
                  <li key={i} className="text-[13px] bg-blue-50 text-blue-900 rounded-lg px-3 py-2 leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {step.questions && step.questions.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Questions
              </p>
              <ul className="space-y-1.5">
                {step.questions.map((q, i) => (
                  <li key={i} className="text-[13px] bg-violet-50 text-violet-900 rounded-lg px-3 py-2 leading-relaxed">
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {step.key_phrases && step.key_phrases.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Déclencheurs copilote
              </p>
              <div className="flex flex-wrap gap-1.5">
                {step.key_phrases.map((phrase, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal text-stone-500 border-stone-200">
                    "{phrase}"
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {step.tips && step.tips.length > 0 && (
            <section className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3 h-3" /> Tips
              </p>
              <ul className="space-y-1.5">
                {step.tips.map((tip, i) => (
                  <li key={i} className="text-[13px] text-amber-800 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
