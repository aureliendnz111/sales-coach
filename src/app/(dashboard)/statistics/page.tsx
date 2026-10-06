"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, BarChart3, Loader2, Minus, PhoneCall, Swords, Trophy, Calendar, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang, type Lang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";
import {
  DIMENSIONS, OUTCOMES, IDEAL_TALK, byScript, kpis, outcomeBreakdown, profile, splitPeriods, talkStats, toCallRows, toSessionRows, trend, winSignals,
  type CallRow, type Metric, type Outcome, type PeriodDays, type SessionRow,
} from "@/lib/stats";
import { Card, Empty, ScoreBar, TrendChart, scoreTone } from "@/components/stats/charts";

type Txt = Record<Lang, string>;

const T = {
  title:      { fr: "Statistiques", en: "Statistics", pt: "Estatísticas" },
  subtitle:   { fr: "Votre progression dans le temps, ce qui fait signer et ce qu'il reste à travailler.", en: "Your progress over time, what wins deals and what to work on next.", pt: "O seu progresso ao longo do tempo, o que faz fechar e o que falta trabalhar." },
  allTime:    { fr: "Tout", en: "All", pt: "Tudo" },
  days:       { fr: "{n} j", en: "{n}d", pt: "{n} d" },
  allScripts: { fr: "Tous les scripts", en: "All scripts", pt: "Todos os guiões" },
  noScript:   { fr: "Sans script", en: "No script", pt: "Sem guião" },
  kCalls:     { fr: "Calls analysés", en: "Calls analyzed", pt: "Chamadas analisadas" },
  kClosing:   { fr: "Taux de closing", en: "Closing rate", pt: "Taxa de fecho" },
  kScore:     { fr: "Score moyen", en: "Average score", pt: "Pontuação média" },
  kTalk:      { fr: "Temps de parole", en: "Talk time", pt: "Tempo de fala" },
  kTraining:  { fr: "Entraînement", en: "Practice", pt: "Treino" },
  vsPrev:     { fr: "vs période précédente", en: "vs previous period", pt: "vs período anterior" },
  trendTitle: { fr: "Évolution du score", en: "Score trend", pt: "Evolução da pontuação" },
  trendSubW:  { fr: "Moyenne par semaine", en: "Weekly average", pt: "Média por semana" },
  trendSubD:  { fr: "Moyenne par jour", en: "Daily average", pt: "Média por dia" },
  overall:    { fr: "Global", en: "Overall", pt: "Global" },
  noData:     { fr: "Pas encore de données sur cette période.", en: "No data for this period yet.", pt: "Ainda sem dados neste período." },
  calls:      { fr: "{n} call(s)", en: "{n} call(s)", pt: "{n} chamada(s)" },
  profTitle:  { fr: "Profil de vendeur", en: "Seller profile", pt: "Perfil de vendedor" },
  profSub:    { fr: "Le trait gris marque la période précédente", en: "The grey tick marks the previous period", pt: "O traço cinzento marca o período anterior" },
  best:       { fr: "Point fort", en: "Strength", pt: "Ponto forte" },
  worst:      { fr: "À travailler", en: "Work on", pt: "A trabalhar" },
  outTitle:   { fr: "Résultats des calls", en: "Call outcomes", pt: "Resultados das chamadas" },
  outSub:     { fr: "Dernier statut connu de chaque lead", en: "Latest known status of each lead", pt: "Último estado conhecido de cada lead" },
  unknown:    { fr: "{n} sans résultat renseigné", en: "{n} without an outcome", pt: "{n} sem resultado definido" },
  winTitle:   { fr: "Ce qui fait signer", en: "What wins deals", pt: "O que faz fechar" },
  winSub:     { fr: "Taux de closing selon le score du call", en: "Closing rate by call score", pt: "Taxa de fecho por pontuação" },
  closedAvg:  { fr: "Score moyen, calls closés", en: "Average score, closed calls", pt: "Pontuação média, chamadas fechadas" },
  lostAvg:    { fr: "Score moyen, calls perdus", en: "Average score, lost calls", pt: "Pontuação média, chamadas perdidas" },
  gap:        { fr: "Plus gros écart entre gagnés et perdus : {dim} ({a} vs {b}).", en: "Biggest gap between won and lost: {dim} ({a} vs {b}).", pt: "Maior diferença entre ganhas e perdidas: {dim} ({a} vs {b})." },
  needOutcomes: { fr: "Renseignez le résultat de vos calls (closé, perdu…) pour voir ce qui fait signer.", en: "Set the outcome of your calls (closed, lost…) to see what wins deals.", pt: "Defina o resultado das chamadas (fechado, perdido…) para ver o que faz fechar." },
  talkTitle:  { fr: "Temps de parole", en: "Talk time", pt: "Tempo de fala" },
  talkSub:    { fr: "Zone idéale : {min} à {max} % de parole pour vous", en: "Ideal zone: you talk {min} to {max}%", pt: "Zona ideal: {min} a {max}% de fala para si" },
  inZone:     { fr: "des calls dans la zone idéale", en: "of calls in the ideal zone", pt: "das chamadas na zona ideal" },
  closeIn:    { fr: "Closing dans la zone", en: "Closing in the zone", pt: "Fecho na zona" },
  closeOut:   { fr: "Closing hors zone", en: "Closing outside", pt: "Fecho fora da zona" },
  scrTitle:   { fr: "Comparatif des scripts", en: "Scripts compared", pt: "Comparação de guiões" },
  colScript:  { fr: "Script", en: "Script", pt: "Guião" },
  colCalls:   { fr: "Calls", en: "Calls", pt: "Chamadas" },
  colScore:   { fr: "Score moyen", en: "Avg. score", pt: "Pont. média" },
  colClosing: { fr: "Closing", en: "Closing", pt: "Fecho" },
  colWeak:    { fr: "Axe faible", en: "Weak spot", pt: "Ponto fraco" },
  emptyTitle: { fr: "Pas encore assez de calls", en: "Not enough calls yet", pt: "Ainda não há chamadas suficientes" },
  emptySub:   { fr: "Analysez quelques calls pour voir vos statistiques apparaître ici.", en: "Analyze a few calls to see your statistics here.", pt: "Analise algumas chamadas para ver aqui as suas estatísticas." },
  analyze:    { fr: "Analyser un call", en: "Analyze a call", pt: "Analisar uma chamada" },
  practice:   { fr: "S'entraîner", en: "Practice", pt: "Treinar" },
} satisfies Record<string, Txt>;

const DIM_LABEL: Record<Metric, Txt> = {
  overall:    T.overall,
  process:    { fr: "Process", en: "Process", pt: "Processo" },
  discovery:  { fr: "Découverte", en: "Discovery", pt: "Descoberta" },
  objections: { fr: "Objections", en: "Objections", pt: "Objeções" },
  posture:    { fr: "Posture", en: "Posture", pt: "Postura" },
  conclusion: { fr: "Conclusion", en: "Close", pt: "Fecho" },
};

const OUTCOME_UI: Record<Outcome, { bar: string; icon: React.ReactNode }> = {
  closed:      { bar: "bg-emerald-500", icon: <Trophy className="w-3.5 h-3.5 text-emerald-600" /> },
  next_call:   { bar: "bg-sky-500",     icon: <Calendar className="w-3.5 h-3.5 text-sky-600" /> },
  no_decision: { bar: "bg-stone-400",   icon: <Minus className="w-3.5 h-3.5 text-stone-500" /> },
  lost:        { bar: "bg-rose-500",    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" /> },
};

const DATE_LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB", pt: "pt-PT" };
const PERIODS: PeriodDays[] = [7, 30, 90, null];
const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((acc, [k, x]) => acc.replace(`{${k}}`, String(x)), s);

function Delta({ value, previous, unit = "", invert = false }: { value: number | null; previous: number | null; unit?: string; invert?: boolean }) {
  if (value === null || previous === null) return null;
  const diff = value - previous;
  if (diff === 0) return <span className="text-[11px] text-stone-400 tabular-nums">=</span>;
  const good = invert ? diff < 0 : diff > 0;
  const Icon = diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums", good ? "text-emerald-600" : "text-rose-600")}>
      <Icon className="w-3 h-3" />{diff > 0 ? "+" : ""}{diff}{unit}
    </span>
  );
}

function Kpi({ label, value, unit, previous, deltaUnit, showDelta }: { label: string; value: number | null; unit?: string; previous: number | null; deltaUnit?: string; showDelta: boolean }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-4 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500 truncate">{label}</p>
      <p className="text-[28px] font-bold text-stone-900 tabular-nums leading-none mt-2">
        {value ?? "-"}{value !== null && unit && <span className="text-[15px] font-semibold text-stone-400 ml-0.5">{unit}</span>}
      </p>
      <div className="h-4 mt-1.5">{showDelta && <Delta value={value} previous={previous} unit={deltaUnit} />}</div>
    </div>
  );
}

export default function StatisticsPage() {
  const { lang } = useLang();
  const [calls, setCalls] = useState<CallRow[] | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [period, setPeriod] = useState<PeriodDays>(30);
  const [scriptId, setScriptId] = useState<string>("all");
  const [metric, setMetric] = useState<Metric>("overall");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => { setCalls(toCallRows(d.analyses ?? [])); setSessions(toSessionRows(d.sessions ?? [])); })
      .catch(() => setCalls([]));
  }, []);

  const scripts = useMemo(() => {
    const m = new Map<string, string>();
    (calls ?? []).forEach(c => m.set(c.scriptId ?? "none", c.scriptName ?? T.noScript[lang]));
    return [...m.entries()];
  }, [calls, lang]);

  const data = useMemo(() => {
    if (!calls) return null;
    const filtered = scriptId === "all" ? calls : calls.filter(c => (c.scriptId ?? "none") === scriptId);
    const sess = scriptId === "all" ? sessions : sessions.filter(s => (s.scriptId ?? "none") === scriptId);
    const c = splitPeriods(filtered, period, now);
    const s = splitPeriods(sess, period, now);
    return {
      c,
      k: kpis(c, s),
      trend: trend(c.current, metric, period, now),
      profile: profile(c.current, c.previous),
      outcomes: outcomeBreakdown(c.current),
      win: winSignals(c.current),
      talk: talkStats(c.current),
      scripts: byScript(c.current),
    };
  }, [calls, sessions, period, scriptId, metric, now]);

  const fmtBucket = (start: number) =>
    new Date(start).toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "short" });
  const nCalls = (n: number) => fill(T.calls[lang], { n });

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">{T.title[lang]}</h1>
          <p className="text-sm text-stone-500 mt-0.5">{T.subtitle[lang]}</p>
        </div>
        {/* Filters: one row, above every chart */}
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-stone-200 rounded-lg p-0.5" role="group" aria-label="Period">
            {PERIODS.map(p => (
              <button key={String(p)} onClick={() => setPeriod(p)} aria-pressed={period === p}
                className={cn("px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors", period === p ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900")}>
                {p === null ? T.allTime[lang] : fill(T.days[lang], { n: p })}
              </button>
            ))}
          </div>
          <select value={scriptId} onChange={e => setScriptId(e.target.value)}
            className="h-9 bg-white border border-stone-200 rounded-lg px-3 text-[12.5px] text-stone-700 max-w-[220px]">
            <option value="all">{T.allScripts[lang]}</option>
            {scripts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
      </div>

      {!data ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 animate-spin text-stone-300" /></div>
      ) : calls!.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm py-16 flex flex-col items-center text-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-violet-500" /></span>
          <p className="text-[15px] font-semibold text-stone-900">{T.emptyTitle[lang]}</p>
          <p className="text-[13px] text-stone-500 max-w-sm">{T.emptySub[lang]}</p>
          <div className="flex gap-2 mt-2">
            <Link href="/call-analysis/new" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"><PhoneCall className="w-3.5 h-3.5" />{T.analyze[lang]}</Link>
            <Link href="/playground" className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"><Swords className="w-3.5 h-3.5" />{T.practice[lang]}</Link>
          </div>
        </div>
      ) : (
        <>
          {/* 1. Key numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Kpi label={T.kCalls[lang]} value={data.k.calls.value} previous={data.k.calls.previous} showDelta={period !== null} />
            <Kpi label={T.kClosing[lang]} value={data.k.closing.value} unit="%" previous={data.k.closing.previous} deltaUnit=" pts" showDelta={period !== null} />
            <Kpi label={T.kScore[lang]} value={data.k.score.value} previous={data.k.score.previous} deltaUnit=" pts" showDelta={period !== null} />
            <Kpi label={T.kTalk[lang]} value={data.k.talk.value} unit="%" previous={null} showDelta={false} />
            <Kpi label={T.kTraining[lang]} value={data.k.training.value} unit=" min" previous={data.k.training.previous} deltaUnit=" min" showDelta={period !== null} />
          </div>

          {/* 2 + 3. Trend and profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2" title={T.trendTitle[lang]} sub={period === 7 ? T.trendSubD[lang] : T.trendSubW[lang]}>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(["overall", ...DIMENSIONS] as Metric[]).map(m => (
                  <button key={m} onClick={() => setMetric(m)} aria-pressed={metric === m}
                    className={cn("text-[12px] px-2.5 py-1 rounded-full border transition-colors",
                      metric === m ? "bg-violet-600 border-violet-600 text-white" : "border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-800")}>
                    {DIM_LABEL[m][lang]}
                  </button>
                ))}
              </div>
              <TrendChart points={data.trend} formatLabel={fmtBucket} emptyText={T.noData[lang]} nLabel={nCalls} />
            </Card>

            <Card title={T.profTitle[lang]} sub={period !== null ? T.profSub[lang] : undefined}>
              {data.profile.rows.every(r => r.value === null) ? <Empty text={T.noData[lang]} /> : (
                <div className="space-y-4">
                  {data.profile.rows.map(r => {
                    const tone = scoreTone(r.value);
                    return (
                      <div key={r.dim}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[12.5px] text-stone-600 flex items-center gap-1.5">
                            {DIM_LABEL[r.dim][lang]}
                            {data.profile.best === r.dim && <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-1.5 py-px">{T.best[lang]}</span>}
                            {data.profile.worst === r.dim && <span className="text-[10px] font-medium text-amber-700 bg-amber-50 rounded-full px-1.5 py-px">{T.worst[lang]}</span>}
                          </span>
                          <span className="flex items-center gap-2">
                            {period !== null && <Delta value={r.value} previous={r.previous} />}
                            <span className={cn("text-[13px] font-semibold tabular-nums", tone.text)}>{r.value ?? "-"}</span>
                          </span>
                        </div>
                        <ScoreBar value={r.value} previous={period !== null ? r.previous : null} tone={tone.bar} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* 4 + 5. Outcomes and what wins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title={T.outTitle[lang]} sub={T.outSub[lang]}>
              {data.outcomes.known === 0 ? <Empty text={T.needOutcomes[lang]} /> : (
                <>
                  <div className="flex h-3 gap-0.5 rounded-full overflow-hidden" role="img"
                    aria-label={OUTCOMES.map(o => `${i18n.outcomes[o][lang]}: ${data.outcomes.counts[o]}`).join(", ")}>
                    {OUTCOMES.filter(o => data.outcomes.counts[o]).map(o => (
                      <div key={o} className={OUTCOME_UI[o].bar} style={{ flexGrow: data.outcomes.counts[o] }} />
                    ))}
                  </div>
                  <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {OUTCOMES.map(o => {
                      const n = data.outcomes.counts[o];
                      return (
                        <li key={o} className="flex items-center gap-2 text-[12.5px] text-stone-600">
                          {OUTCOME_UI[o].icon}
                          <span className="flex-1">{i18n.outcomes[o][lang]}</span>
                          <span className="font-semibold text-stone-900 tabular-nums">{n}</span>
                          <span className="text-stone-400 tabular-nums w-10 text-right">{Math.round((n / data.outcomes.known) * 100)}%</span>
                        </li>
                      );
                    })}
                  </ul>
                  {data.outcomes.unknown > 0 && <p className="text-[11.5px] text-stone-400 mt-3">{fill(T.unknown[lang], { n: data.outcomes.unknown })}</p>}
                </>
              )}
            </Card>

            <Card title={T.winTitle[lang]} sub={T.winSub[lang]}>
              {data.outcomes.known === 0 ? <Empty text={T.needOutcomes[lang]} /> : (
                <>
                  <div className="grid grid-cols-4 gap-2 items-end h-[112px]">
                    {data.win.bands.map(b => (
                      <div key={b.label} className="flex flex-col items-center justify-end h-full gap-1" title={nCalls(b.n)}>
                        <span className="text-[12px] font-semibold text-stone-900 tabular-nums">{b.rate === null ? "-" : `${b.rate}%`}</span>
                        <div className="w-full max-w-[44px] rounded-t-[4px] bg-violet-500" style={{ height: `${Math.max(b.rate ?? 0, 2) * 0.72}px`, opacity: b.rate === null ? 0.15 : 1 }} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-1.5 border-t border-stone-200 pt-1.5">
                    {data.win.bands.map(b => (
                      <div key={b.label} className="text-center">
                        <p className="text-[11px] text-stone-600 tabular-nums">{b.label}</p>
                        <p className="text-[10.5px] text-stone-400">{nCalls(b.n)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-lg bg-stone-50 px-3 py-2.5">
                      <p className="text-[11px] text-stone-500">{T.closedAvg[lang]}</p>
                      <p className="text-[18px] font-bold text-stone-900 tabular-nums">{data.win.closedAvg ?? "-"}</p>
                    </div>
                    <div className="rounded-lg bg-stone-50 px-3 py-2.5">
                      <p className="text-[11px] text-stone-500">{T.lostAvg[lang]}</p>
                      <p className="text-[18px] font-bold text-stone-900 tabular-nums">{data.win.lostAvg ?? "-"}</p>
                    </div>
                  </div>
                  {data.win.gap && (
                    <p className="text-[12.5px] text-stone-600 mt-3">
                      {fill(T.gap[lang], { dim: DIM_LABEL[data.win.gap.dim][lang], a: data.win.gap.closed, b: data.win.gap.lost })}
                    </p>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* 6. Talk time + 7. Scripts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card title={T.talkTitle[lang]} sub={fill(T.talkSub[lang], IDEAL_TALK)}>
              {data.talk.n === 0 ? <Empty text={T.noData[lang]} /> : (
                <>
                  <div className="relative h-10">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-stone-100 rounded-full" />
                    <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-emerald-100 rounded-full"
                      style={{ left: `${IDEAL_TALK.min}%`, width: `${IDEAL_TALK.max - IDEAL_TALK.min}%` }} />
                    {data.talk.values.map((v, i) => (
                      <span key={i} className={cn("absolute top-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white",
                        v >= IDEAL_TALK.min && v <= IDEAL_TALK.max ? "bg-emerald-500" : "bg-stone-400")} style={{ left: `${v}%` }} title={`${v}%`} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10.5px] text-stone-400 tabular-nums"><span>0%</span><span>50%</span><span>100%</span></div>
                  <p className="mt-4 text-[13px] text-stone-600">
                    <span className="text-[22px] font-bold text-stone-900 tabular-nums mr-1.5">{data.talk.inZoneShare}%</span>{T.inZone[lang]}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="rounded-lg bg-emerald-50 px-3 py-2">
                      <p className="text-[11px] text-emerald-700">{T.closeIn[lang]}</p>
                      <p className="text-[16px] font-bold text-stone-900 tabular-nums">{data.talk.closingInZone === null ? "-" : `${data.talk.closingInZone}%`}</p>
                    </div>
                    <div className="rounded-lg bg-stone-50 px-3 py-2">
                      <p className="text-[11px] text-stone-500">{T.closeOut[lang]}</p>
                      <p className="text-[16px] font-bold text-stone-900 tabular-nums">{data.talk.closingOutZone === null ? "-" : `${data.talk.closingOutZone}%`}</p>
                    </div>
                  </div>
                </>
              )}
            </Card>

            <Card className="lg:col-span-2" title={T.scrTitle[lang]}>
              {data.scripts.length === 0 ? <Empty text={T.noData[lang]} /> : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                      <th className="font-semibold pb-2">{T.colScript[lang]}</th>
                      <th className="font-semibold pb-2 text-right">{T.colCalls[lang]}</th>
                      <th className="font-semibold pb-2 text-right">{T.colScore[lang]}</th>
                      <th className="font-semibold pb-2 text-right">{T.colClosing[lang]}</th>
                      <th className="font-semibold pb-2 pl-6">{T.colWeak[lang]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {data.scripts.map(s => {
                      const tone = scoreTone(s.score);
                      return (
                        <tr key={s.id}>
                          <td className="py-2.5 pr-3 text-stone-800 font-medium truncate max-w-[260px]">{s.name ?? T.noScript[lang]}</td>
                          <td className="py-2.5 text-right tabular-nums text-stone-600">{s.calls}</td>
                          <td className="py-2.5 text-right"><span className={cn("font-semibold tabular-nums", tone.text)}>{s.score ?? "-"}</span></td>
                          <td className="py-2.5 text-right tabular-nums text-stone-600">{s.closing === null ? "-" : `${s.closing}%`}</td>
                          <td className="py-2.5 pl-6 text-stone-600">{s.weakest ? DIM_LABEL[s.weakest][lang] : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

