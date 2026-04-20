"use client";
import { useState } from "react";
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

type Props = { steps: Step[]; objections: Objection[] };

export function ScriptTabs({ steps, objections }: Props) {
  const [tab, setTab] = useState<"steps" | "objections">("steps");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-stone-100">
        <button
          onClick={() => setTab("steps")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "steps"
              ? "border-stone-900 text-stone-900"
              : "border-transparent text-stone-400 hover:text-stone-600"
          )}
        >
          Étapes · {steps.length}
        </button>
        <button
          onClick={() => setTab("objections")}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "objections"
              ? "border-stone-900 text-stone-900"
              : "border-transparent text-stone-400 hover:text-stone-600"
          )}
        >
          Objections · {objections.length}
        </button>
      </div>

      {tab === "steps" && (
        <div className="space-y-3">
          {steps.map(step => <StepCard key={step.id} step={step} />)}
        </div>
      )}
      {tab === "objections" && (
        <div className="space-y-3">
          {objections.map(obj => <ObjectionCard key={obj.id} objection={obj} />)}
        </div>
      )}
    </div>
  );
}
