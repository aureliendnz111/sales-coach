"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = { label: string; score: number; recommendation?: string; icon?: React.ReactNode };

function scoreColor(s: number) {
  if (s >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
  if (s >= 50) return { bar: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
  return { bar: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
}

export function ScoreGauge({ label, score, recommendation, icon }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 100); return () => clearTimeout(t); }, []);

  const c = scoreColor(score);
  return (
    <div className={cn("border rounded-xl bg-white shadow-sm p-4 space-y-3", c.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] font-medium text-stone-700">
          {icon}
          {label}
        </div>
        <span className={cn("text-[22px] font-bold tabular-nums", c.text)}>{score}</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all ease-out duration-700", c.bar)}
          style={{ width: ready ? `${score}%` : "0%" }}
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
