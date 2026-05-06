"use client";
import { cn } from "@/lib/utils";

type Props = { label: string; score: number; recommendation?: string; icon?: React.ReactNode };

function scoreColor(s: number) {
  if (s >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (s >= 50) return { bar: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50" };
  return { bar: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50" };
}

export function ScoreGauge({ label, score, recommendation, icon }: Props) {
  const c = scoreColor(score);
  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-stone-700">
          {icon}
          {label}
        </div>
        <span className={cn("text-[22px] font-bold tabular-nums", c.text)}>{score}</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", c.bar)}
          style={{ width: `${score}%` }}
        />
      </div>
      {recommendation && (
        <p className={cn("text-[12px] leading-relaxed rounded-lg px-3 py-2", c.bg,
          score >= 75 ? "text-emerald-700" : score >= 50 ? "text-amber-700" : "text-rose-700"
        )}>
          {recommendation}
        </p>
      )}
    </div>
  );
}
