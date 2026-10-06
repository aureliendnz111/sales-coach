"use client";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  subtitle: string;
  scoreLabel: string;
  score: number;
  items: readonly { label: string; score: number; color: string; suffix?: string }[];
  insights: readonly { type: string; text: string }[];
};

// Analysis score card — animates its score and bars the first time it scrolls into view.
export function ScoreCard({ label, subtitle, scoreLabel, score, items, insights }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      setReady(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(score); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1200, 1);
        setShown(Math.round((1 - Math.pow(1 - p, 3)) * score));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [score]);

  return (
    <div ref={ref} className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 text-left">
      <div className="bg-[#0E0E16] px-5 py-4 flex items-start justify-between gap-4 border-b border-white/5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-widest">{label}</p>
          <p className="text-[14px] font-medium text-white mt-1">{subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[44px] font-bold text-violet-400 leading-none tabular-nums">{shown}</div>
          <p className="text-[11px] text-stone-500 mt-0.5">{scoreLabel}</p>
        </div>
      </div>
      <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-stone-100">
        {items.map((item, i) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-500">{item.label}</span>
              <span className="text-[11px] font-semibold text-stone-700 tabular-nums">{item.score}{item.suffix ?? ""}</span>
            </div>
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all ease-out", item.color)}
                style={{ width: ready ? `${item.score}%` : "0%", transitionDuration: "900ms", transitionDelay: ready ? `${i * 80}ms` : "0ms" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 space-y-2">
        {insights.map(ins => (
          <div key={ins.text} className="flex items-start gap-2">
            {ins.type === "good"
              ? <CheckCircle2 className="mt-px w-4 h-4 text-emerald-500 shrink-0" />
              : <AlertTriangle className="mt-px w-4 h-4 text-amber-500 shrink-0" />}
            <span className="text-[12px] text-stone-600 leading-snug">{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
