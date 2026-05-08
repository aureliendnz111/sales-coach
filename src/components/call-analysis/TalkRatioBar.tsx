"use client";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

type TalkRatio = { coach: number; prospect: number; coach_name?: string; prospect_name?: string };

export function TalkRatioBar({ ratio }: { ratio: TalkRatio }) {
  const { lang } = useLang();
  const coachName = ratio.coach_name || "Coach";
  const prospectName = ratio.prospect_name || "Prospect";
  const idealCoach = 40;
  const coachDiff = ratio.coach - idealCoach;

  const tooMuchMsg: Record<string, string> = {
    fr: `Tu parles trop (${ratio.coach}%). Laisse plus d'espace au prospect pour s'exprimer.`,
    en: `You talk too much (${ratio.coach}%). Give more space to the prospect to express themselves.`,
    pt: `Fala demasiado (${ratio.coach}%). Dê mais espaço ao prospeto para se expressar.`,
  };
  const tooLittleMsg: Record<string, string> = {
    fr: `Tu parles peu (${ratio.coach}%). C'est bien, assure-toi que tu guides quand même la conversation.`,
    en: `You talk little (${ratio.coach}%). That's good, make sure you still guide the conversation.`,
    pt: `Fala pouco (${ratio.coach}%). Isso é bom, certifique-se de que ainda orienta a conversa.`,
  };

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-stone-700">{i18n.talkRatio.title[lang]}</span>
        <span className="text-[11px] text-stone-500">{i18n.talkRatio.ideal[lang]}</span>
      </div>

      <div className="flex h-5 rounded-full overflow-hidden">
        <div
          className="bg-stone-800 flex items-center justify-center transition-all duration-700"
          style={{ width: `${ratio.coach}%` }}
        >
          {ratio.coach > 15 && (
            <span className="text-[10px] font-semibold text-white">{ratio.coach}%</span>
          )}
        </div>
        <div
          className="bg-stone-200 flex items-center justify-center transition-all duration-700"
          style={{ width: `${ratio.prospect}%` }}
        >
          {ratio.prospect > 15 && (
            <span className="text-[10px] font-semibold text-stone-500">{ratio.prospect}%</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[12px] text-stone-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-800 inline-block" />
          {coachName}
        </div>
        <div className="flex items-center gap-1.5">
          {prospectName}
          <span className="w-2.5 h-2.5 rounded-full bg-stone-200 border border-stone-300 inline-block" />
        </div>
      </div>

      {Math.abs(coachDiff) > 10 && (
        <p className="text-[12px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
          {coachDiff > 0 ? tooMuchMsg[lang] : tooLittleMsg[lang]}
        </p>
      )}
    </div>
  );
}
