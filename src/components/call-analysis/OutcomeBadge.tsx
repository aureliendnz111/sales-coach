import { cn } from "@/lib/utils";
import { Trophy, Calendar, Minus, XCircle } from "lucide-react";

export type Outcome = "closed" | "next_call" | "no_decision" | "lost" | null;

const OUTCOME_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  closed:      { label: "Closé",           bg: "bg-emerald-50", text: "text-emerald-700", icon: <Trophy className="w-3 h-3" /> },
  next_call:   { label: "Prochain appel",  bg: "bg-blue-50",    text: "text-blue-700",    icon: <Calendar className="w-3 h-3" /> },
  no_decision: { label: "Sans décision",   bg: "bg-stone-100",  text: "text-stone-600",   icon: <Minus className="w-3 h-3" /> },
  lost:        { label: "Perdu",           bg: "bg-rose-50",    text: "text-rose-700",    icon: <XCircle className="w-3 h-3" /> },
};

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  if (!outcome) return <span className="text-[12px] text-stone-500 italic">Non renseigné</span>;
  const c = OUTCOME_CONFIG[outcome];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full", c.bg, c.text)}>
      {c.icon}
      {c.label}
    </span>
  );
}

export { OUTCOME_CONFIG };
