"use client";
import Link from "next/link";
import { Monitor } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

export function MobileBlock() {
  const { lang } = useLang();
  return (
    <div className="flex md:hidden min-h-screen bg-white flex-col items-center justify-center px-8 text-center gap-5">
      <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
        <Monitor className="w-6 h-6 text-stone-400" />
      </div>
      <div className="space-y-2">
        <p className="text-[16px] font-semibold text-stone-900">{i18n.layout.desktopTitle[lang]}</p>
        <p className="text-[13.5px] text-stone-400 leading-relaxed max-w-xs">{i18n.layout.desktopSub[lang]}</p>
      </div>
      <Link href="/" className="text-[13px] font-medium text-violet-600 hover:text-violet-700">{i18n.layout.backHome[lang]}</Link>
    </div>
  );
}
