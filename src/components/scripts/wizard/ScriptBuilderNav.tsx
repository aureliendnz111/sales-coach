"use client";
import { cn } from "@/lib/utils";

type Step = { order: number; name: string };
type Objection = { order: number; label: string };

type Props = { steps: Step[]; objections: Objection[] };

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ScriptBuilderNav({ steps, objections }: Props) {
  return (
    <div className="hidden xl:block w-48 shrink-0 sticky top-8 self-start">
      <div className="space-y-5">
        <div>
          <button
            onClick={() => scrollTo("section-steps")}
            className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 hover:text-stone-600 transition-colors block"
          >
            Étapes
          </button>
          <div className="space-y-0.5">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => scrollTo(`step-${i}`)}
                className="flex items-center gap-2 w-full text-left group cursor-pointer rounded-lg px-1.5 py-1 hover:bg-stone-100 transition-colors"
              >
                <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-600 text-[9px] font-bold flex items-center justify-center shrink-0 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                  {step.order}
                </span>
                <span className={cn(
                  "text-xs truncate transition-colors",
                  step.name ? "text-stone-700 group-hover:text-stone-900" : "text-stone-300 italic group-hover:text-stone-400"
                )}>
                  {step.name || "Sans titre"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {objections.length > 0 && (
          <div>
            <button
              onClick={() => scrollTo("section-objections")}
              className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2 hover:text-stone-600 transition-colors block"
            >
              Objections
            </button>
            <div className="space-y-0.5">
              {objections.map((obj, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(`objection-${i}`)}
                  className="flex items-center gap-2 w-full text-left group cursor-pointer rounded-lg px-1.5 py-1 hover:bg-rose-50 transition-colors"
                >
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-500 text-[9px] font-bold flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    {obj.order}
                  </span>
                  <span className={cn(
                    "text-xs truncate transition-colors",
                    obj.label ? "text-stone-700 group-hover:text-stone-900" : "text-stone-300 italic group-hover:text-stone-400"
                  )}>
                    {obj.label || "Sans titre"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
