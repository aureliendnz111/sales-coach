// Pure aggregation helpers for the Statistics page. No React, no network.

export const DIMENSIONS = ["process", "discovery", "objections", "posture", "conclusion"] as const;
export type Dimension = (typeof DIMENSIONS)[number];
export type Metric = "overall" | Dimension;
export type Outcome = "closed" | "next_call" | "no_decision" | "lost";
export const OUTCOMES: Outcome[] = ["closed", "next_call", "no_decision", "lost"];

export type Scores = Partial<Record<Metric, number>>;

export type CallRow = {
  id: string;
  date: number;            // ms timestamp: call date, or creation date when unknown
  outcome: Outcome | null; // latest known lead status, else the outcome set at import
  scores: Scores | null;
  talkCoach: number | null;
  scriptId: string | null;
  scriptName: string | null;
};

export type SessionRow = { id: string; date: number; durationSec: number; scriptId: string | null };

export type PeriodDays = 7 | 30 | 90 | null; // null = all time

const DAY = 86_400_000;
export const IDEAL_TALK = { min: 30, max: 45 } as const;

type ApiAnalysis = {
  id: string; call_date: string | null; created_at: string;
  outcome: string | null; lead_status: string | null;
  scores: Scores | null; talk_ratio: { coach?: number } | null;
  script_id: string | null; scripts: { name: string } | { name: string }[] | null;
};
type ApiSession = { id: string; created_at: string; duration_seconds: number | null; script_id: string | null };

const isOutcome = (v: string | null): v is Outcome => !!v && (OUTCOMES as string[]).includes(v);

export function toCallRows(rows: ApiAnalysis[]): CallRow[] {
  return rows.map(r => {
    const script = Array.isArray(r.scripts) ? r.scripts[0] : r.scripts;
    const outcome = isOutcome(r.lead_status) ? r.lead_status : isOutcome(r.outcome) ? r.outcome : null;
    return {
      id: r.id,
      date: new Date(r.call_date ?? r.created_at).getTime(),
      outcome,
      scores: r.scores,
      talkCoach: typeof r.talk_ratio?.coach === "number" ? r.talk_ratio.coach : null,
      scriptId: r.script_id,
      scriptName: script?.name ?? null,
    };
  });
}

export function toSessionRows(rows: ApiSession[]): SessionRow[] {
  return rows.map(r => ({ id: r.id, date: new Date(r.created_at).getTime(), durationSec: r.duration_seconds ?? 0, scriptId: r.script_id }));
}

/** Rows of the selected period and of the period just before it (same length). */
export function splitPeriods<T extends { date: number }>(rows: T[], period: PeriodDays, now: number) {
  if (period === null) return { current: rows, previous: [] as T[] };
  const start = now - period * DAY;
  const prevStart = start - period * DAY;
  return {
    current: rows.filter(r => r.date >= start && r.date <= now),
    previous: rows.filter(r => r.date >= prevStart && r.date < start),
  };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const score = (c: CallRow, m: Metric) => (typeof c.scores?.[m] === "number" ? (c.scores[m] as number) : null);
const scoresOf = (calls: CallRow[], m: Metric) => calls.map(c => score(c, m)).filter((v): v is number => v !== null);

export function avgScore(calls: CallRow[], m: Metric = "overall") {
  const v = mean(scoresOf(calls, m));
  return v === null ? null : Math.round(v);
}

/** Share of calls with a known outcome that were closed (0-100). */
export function closingRate(calls: CallRow[]) {
  const known = calls.filter(c => c.outcome);
  return known.length ? Math.round((known.filter(c => c.outcome === "closed").length / known.length) * 100) : null;
}

export function avgTalk(calls: CallRow[]) {
  const v = mean(calls.map(c => c.talkCoach).filter((v): v is number => v !== null));
  return v === null ? null : Math.round(v);
}

export function kpis(calls: { current: CallRow[]; previous: CallRow[] }, sessions: { current: SessionRow[]; previous: SessionRow[] }) {
  const minutes = (s: SessionRow[]) => Math.round(s.reduce((a, r) => a + r.durationSec, 0) / 60);
  const pair = <T,>(f: (x: CallRow[]) => T) => ({ value: f(calls.current), previous: calls.previous.length ? f(calls.previous) : null });
  return {
    calls: { value: calls.current.length, previous: calls.previous.length || null },
    closing: pair(closingRate),
    score: pair(c => avgScore(c)),
    talk: pair(avgTalk),
    training: { value: minutes(sessions.current), previous: sessions.previous.length ? minutes(sessions.previous) : null },
  };
}

export type TrendPoint = { start: number; avg: number | null; n: number };

/** Average of a metric per bucket (day for a 7-day period, week otherwise). */
export function trend(calls: CallRow[], m: Metric, period: PeriodDays, now: number): TrendPoint[] {
  const bucket = period === 7 ? DAY : 7 * DAY;
  const first = period === null ? (calls.length ? Math.min(...calls.map(c => c.date)) : now) : now - period * DAY;
  const count = Math.max(1, Math.ceil((now - first) / bucket));
  const start0 = now - count * bucket;
  const points: TrendPoint[] = Array.from({ length: count }, (_, i) => ({ start: start0 + i * bucket, avg: null, n: 0 }));
  const sums = points.map(() => 0);
  for (const c of calls) {
    const v = score(c, m);
    if (v === null) continue;
    const i = Math.min(count - 1, Math.max(0, Math.floor((c.date - start0) / bucket)));
    sums[i] += v; points[i].n++;
  }
  points.forEach((p, i) => { if (p.n) p.avg = Math.round(sums[i] / p.n); });
  return points;
}

export function profile(current: CallRow[], previous: CallRow[]) {
  const rows = DIMENSIONS.map(d => ({ dim: d, value: avgScore(current, d), previous: previous.length ? avgScore(previous, d) : null }));
  const scored = rows.filter(r => r.value !== null) as { dim: Dimension; value: number; previous: number | null }[];
  const best = scored.length ? scored.reduce((a, b) => (b.value > a.value ? b : a)).dim : null;
  const worst = scored.length > 1 ? scored.reduce((a, b) => (b.value < a.value ? b : a)).dim : null;
  return { rows, best, worst };
}

export function outcomeBreakdown(calls: CallRow[]) {
  const counts = Object.fromEntries(OUTCOMES.map(o => [o, 0])) as Record<Outcome, number>;
  let unknown = 0;
  for (const c of calls) { if (c.outcome) counts[c.outcome]++; else unknown++; }
  return { counts, unknown, known: calls.length - unknown };
}

export const SCORE_BANDS = [
  { min: 0, max: 49, label: "< 50" },
  { min: 50, max: 64, label: "50-64" },
  { min: 65, max: 74, label: "65-74" },
  { min: 75, max: 100, label: "75+" },
] as const;

/** What separates closed deals from lost ones. */
export function winSignals(calls: CallRow[]) {
  const closed = calls.filter(c => c.outcome === "closed");
  const lost = calls.filter(c => c.outcome === "lost");
  const bands = SCORE_BANDS.map(b => {
    const inBand = calls.filter(c => c.outcome && score(c, "overall") !== null && (score(c, "overall") as number) >= b.min && (score(c, "overall") as number) <= b.max);
    return { label: b.label, n: inBand.length, rate: closingRate(inBand) };
  });
  let gap: { dim: Dimension; closed: number; lost: number } | null = null;
  if (closed.length && lost.length) {
    for (const d of DIMENSIONS) {
      const a = avgScore(closed, d), b = avgScore(lost, d);
      if (a !== null && b !== null && (!gap || a - b > gap.closed - gap.lost)) gap = { dim: d, closed: a, lost: b };
    }
  }
  return { closedAvg: avgScore(closed), lostAvg: avgScore(lost), closedN: closed.length, lostN: lost.length, bands, gap };
}

export function talkStats(calls: CallRow[]) {
  const withTalk = calls.filter(c => c.talkCoach !== null);
  const inZone = withTalk.filter(c => (c.talkCoach as number) >= IDEAL_TALK.min && (c.talkCoach as number) <= IDEAL_TALK.max);
  const outZone = withTalk.filter(c => !inZone.includes(c));
  return {
    n: withTalk.length,
    avg: avgTalk(withTalk),
    inZoneShare: withTalk.length ? Math.round((inZone.length / withTalk.length) * 100) : null,
    closingInZone: closingRate(inZone),
    closingOutZone: closingRate(outZone),
    values: withTalk.map(c => c.talkCoach as number),
  };
}

export function byScript(calls: CallRow[]) {
  const groups = new Map<string, CallRow[]>();
  for (const c of calls) {
    const key = c.scriptId ?? "none";
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups.entries()]
    .map(([id, rows]) => {
      const weakest = DIMENSIONS
        .map(d => ({ d, v: avgScore(rows, d) }))
        .filter((x): x is { d: Dimension; v: number } => x.v !== null)
        .sort((a, b) => a.v - b.v)[0]?.d ?? null;
      return { id, name: rows[0].scriptName, calls: rows.length, score: avgScore(rows), closing: closingRate(rows), weakest };
    })
    .sort((a, b) => b.calls - a.calls);
}
