"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrendPoint } from "@/lib/stats";

// Small, dependency-free charts for the Statistics page.
// Thin marks, one axis, recessive grid, hover tooltips; text stays in stone ink.

export function Card({ title, sub, children, className, action }: { title: string; sub?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("bg-white border border-stone-200 rounded-xl shadow-sm p-5", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[14px] font-semibold text-stone-900">{title}</h2>
          {sub && <p className="text-[12px] text-stone-500 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="text-[12.5px] text-stone-400 py-8 text-center">{text}</p>;
}

/** Line chart of a 0-100 score over time buckets, with crosshair + tooltip. */
export function TrendChart({ points, formatLabel, emptyText, nLabel }: {
  points: TrendPoint[]; formatLabel: (start: number) => string; emptyText: string; nLabel: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.some(p => p.avg !== null)) return <Empty text={emptyText} />;

  const W = 600, H = 200;
  const x = (i: number) => (points.length === 1 ? W / 2 : (i / (points.length - 1)) * W);
  const y = (v: number) => H - (v / 100) * H;
  // Line skips empty buckets but keeps going across them
  const filled = points.map((p, i) => ({ ...p, i })).filter(p => p.avg !== null) as (TrendPoint & { i: number; avg: number })[];
  const d = filled.map((p, k) => `${k ? "L" : "M"}${x(p.i).toFixed(1)},${y(p.avg).toFixed(1)}`).join(" ");
  const area = filled.length > 1 ? `${d} L${x(filled[filled.length - 1].i)},${H} L${x(filled[0].i)},${H} Z` : "";
  const tickEvery = Math.max(1, Math.ceil(points.length / 6));
  const h = hover !== null ? points[hover] : null;

  return (
    <div className="flex gap-2">
      <div className="relative w-7 h-[200px] shrink-0 text-[10.5px] text-stone-400 tabular-nums" aria-hidden>
        {[100, 75, 50, 25, 0].map(v => (
          <span key={v} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - v}%` }}>{v}</span>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="relative h-[200px]" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible" role="img" aria-label={filled.map(p => `${formatLabel(p.start)}: ${p.avg}`).join(", ")}>
            <defs>
              <linearGradient id="stats-trend-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 25, 50, 75, 100].map(v => (
              <line key={v} x1="0" x2={W} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#D6D3D1" : "#F5F5F4"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {area && <path d={area} fill="url(#stats-trend-fill)" />}
            <path d={d} fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="#A8A29E" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
          </svg>
          {/* Markers in HTML so they stay round whatever the width */}
          {filled.map(p => (
            <span key={p.i} className={cn("absolute w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white -translate-x-1/2 -translate-y-1/2 pointer-events-none", hover === p.i && "w-2.5 h-2.5")}
              style={{ left: `${(x(p.i) / W) * 100}%`, top: `${(y(p.avg) / H) * 100}%` }} />
          ))}
          {/* Hit targets: one column per bucket, wider than the marks */}
          <div className="absolute inset-0 flex">
            {points.map((p, i) => (
              <div key={i} className="flex-1 h-full" onMouseEnter={() => setHover(i)} />
            ))}
          </div>
          {h && (
            <div className="absolute top-0 z-10 pointer-events-none -translate-x-1/2 bg-stone-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg whitespace-nowrap"
              style={{ left: `${Math.min(92, Math.max(8, (x(hover as number) / W) * 100))}%` }}>
              <p className="text-stone-400">{formatLabel(h.start)}</p>
              <p className="font-semibold tabular-nums">{h.avg ?? "-"}{h.avg !== null && <span className="text-stone-400 font-normal"> · {nLabel(h.n)}</span>}</p>
            </div>
          )}
        </div>
        <div className="relative h-5 mt-1.5 text-[10.5px] text-stone-400" aria-hidden>
          {points.map((p, i) => (i % tickEvery === 0 || i === points.length - 1) && (
            <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(x(i) / W) * 100}%` }}>{formatLabel(p.start)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Horizontal 0-100 bar with an optional marker for the previous value. */
export function ScoreBar({ value, previous, tone = "bg-violet-500" }: { value: number | null; previous?: number | null; tone?: string }) {
  return (
    <div className="relative h-2 bg-stone-100 rounded-full">
      {value !== null && <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />}
      {previous != null && (
        <span className="absolute -top-1 w-0.5 h-4 rounded-full bg-stone-400" style={{ left: `calc(${previous}% - 1px)` }} title={String(previous)} />
      )}
    </div>
  );
}

export function scoreTone(v: number | null) {
  if (v === null) return { bar: "bg-stone-200", text: "text-stone-400" };
  if (v >= 75) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (v >= 60) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-rose-500", text: "text-rose-600" };
}
