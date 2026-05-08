"use client";
import { useState } from "react";
import { Sparkles, PenLine, LayoutTemplate, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GuidedWizard } from "@/components/scripts/wizard/GuidedWizard";
import { ScratchBuilder } from "@/components/scripts/wizard/ScratchBuilder";
import { TemplateSelector } from "@/components/scripts/wizard/TemplateSelector";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

type Mode = null | "guided" | "scratch" | "template";

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors"
    >
      <ChevronLeft className="w-4 h-4" /> {label}
    </button>
  );
}

export default function NewScriptPage() {
  const [mode, setMode] = useState<Mode>(null);
  const { lang } = useLang();
  const t = i18n.newScriptPage;

  const MODES = [
    {
      id: "guided" as const,
      icon: Sparkles,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      title: t.guidedTitle[lang],
      description: t.guidedDesc[lang],
      tag: t.guidedTag[lang],
      tagStyle: "bg-stone-100 text-stone-400",
      soon: true,
    },
    {
      id: "template" as const,
      icon: LayoutTemplate,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: t.templateTitle[lang],
      description: t.templateDesc[lang],
      tag: t.templateTag[lang],
      tagStyle: "bg-emerald-50 text-emerald-700",
      soon: false,
    },
    {
      id: "scratch" as const,
      icon: PenLine,
      iconBg: "bg-stone-100",
      iconColor: "text-stone-500",
      title: t.scratchTitle[lang],
      description: t.scratchDesc[lang],
      tag: t.scratchTag[lang],
      tagStyle: "bg-stone-100 text-stone-400",
      soon: false,
    },
  ];

  if (mode === "guided") {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
        <BackButton onClick={() => setMode(null)} label={t.back[lang]} />
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">{t.guidedPageTitle[lang]}</h1>
          <p className="text-sm text-stone-500 mt-0.5">{t.guidedPageSub[lang]}</p>
        </div>
        <GuidedWizard />
      </div>
    );
  }

  if (mode === "template") {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
        <BackButton onClick={() => setMode(null)} label={t.back[lang]} />
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">{t.templatePageTitle[lang]}</h1>
          <p className="text-sm text-stone-500 mt-0.5">{t.templatePageSub[lang]}</p>
        </div>
        <TemplateSelector />
      </div>
    );
  }

  if (mode === "scratch") {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
        <BackButton onClick={() => setMode(null)} label={t.back[lang]} />
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">{t.scratchPageTitle[lang]}</h1>
          <p className="text-sm text-stone-500 mt-0.5">{t.scratchPageSub[lang]}</p>
        </div>
        <ScratchBuilder />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      <div>
        <Link
          href="/scripts"
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> {i18n.scripts.title[lang]}
        </Link>
        <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">{t.title[lang]}</h1>
        <p className="text-sm text-stone-500 mt-0.5">{t.subtitle[lang]}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {MODES.map(({ id, icon: Icon, iconBg, iconColor, title, description, tag, tagStyle, soon }) => (
          <button
            key={id}
            onClick={() => !soon && setMode(id)}
            disabled={soon}
            className={cn(
              "flex flex-col gap-3 p-5 rounded-xl border text-left transition-all",
              soon
                ? "border-stone-200 bg-white opacity-60 cursor-not-allowed"
                : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm cursor-pointer"
            )}
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
              <Icon className={cn("w-[18px] h-[18px]", iconColor)} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[13px] text-stone-900 mb-1">{title}</p>
              <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
            </div>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium leading-none self-start", tagStyle)}>
              {tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
