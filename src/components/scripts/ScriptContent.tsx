"use client";
import { cn } from "@/lib/utils";
import { StepCard } from "./StepCard";
import { ObjectionCard } from "./ObjectionCard";

type Step = {
  id: string; order: number; name: string; goal: string | null;
  duration_estimate_minutes: number | null; key_phrases: string[] | null;
  questions: string[] | null; script_lines: string[] | null; tips: string[] | null;
};
type Objection = {
  id: string; order: number; label: string; category: string;
  trigger_phrases: string[] | null; applicable_step_orders: number[] | null;
  responses: string[] | null; key_reframe: string | null;
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SideNav({ steps, objections }: { steps: Step[]; objections: Objection[] }) {
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
          <div className="space-y-1">
            {steps.map((step, i) => (
              <button key={i} onClick={() => scrollTo(`view-step-${i}`)} className="flex items-center gap-2 w-full text-left group cursor-pointer rounded-lg px-1.5 py-1 hover:bg-stone-100 transition-colors">
                <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-600 text-[9px] font-bold flex items-center justify-center shrink-0 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                  {step.order}
                </span>
                <span className={cn("text-xs truncate transition-colors", step.name ? "text-stone-700 group-hover:text-stone-900" : "text-stone-300 italic")}>
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
            <div className="space-y-1">
              {objections.map((obj, i) => (
                <button key={i} onClick={() => scrollTo(`view-objection-${i}`)} className="flex items-center gap-2 w-full text-left group cursor-pointer rounded-lg px-1.5 py-1 hover:bg-rose-50 transition-colors">
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-500 text-[9px] font-bold flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    {obj.order}
                  </span>
                  <span className={cn("text-xs truncate transition-colors", obj.label ? "text-stone-700 group-hover:text-stone-900" : "text-stone-300 italic")}>
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

export function ScriptContent({ steps, objections }: { steps: Step[]; objections: Objection[] }) {
  return (
    <div className="flex gap-10 items-start">
      {/* Contenu principal */}
      <div className="flex-1 min-w-0 space-y-8">
        <section id="section-steps" className="space-y-3">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Étapes · {steps.length}
          </p>
          {steps.map((step, i) => (
            <div key={step.id} id={`view-step-${i}`}>
              <StepCard step={step} />
            </div>
          ))}
        </section>

        <section id="section-objections" className="space-y-3">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Objections · {objections.length}
          </p>
          {objections.map((obj, i) => (
            <div key={obj.id} id={`view-objection-${i}`}>
              <ObjectionCard objection={obj} />
            </div>
          ))}
        </section>
      </div>

      {/* Nav sticky */}
      <SideNav steps={steps} objections={objections} />
    </div>
  );
}
