"use client";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

export default function SessionsPage() {
  const { lang } = useLang();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center px-8">
      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-5">
        <Headphones className="w-7 h-7 text-stone-400" />
      </div>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Live Copilot</h1>
      <p className="text-stone-400 text-sm max-w-xs leading-relaxed">{i18n.copilot.desc[lang]}</p>
      <span className="mt-5 text-xs bg-stone-100 text-stone-500 px-3 py-1.5 rounded-full font-medium">
        {i18n.copilot.soon[lang]}
      </span>
      <Link href="/playground" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-violet-600 hover:text-violet-700 group">
        {i18n.copilot.meanwhile[lang]} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
