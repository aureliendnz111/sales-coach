import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { title: string; sub: string; cta: string; href?: string; icon?: LucideIcon; className?: string };

// Dark call-to-action strip with a violet button, used between landing sections.
export function CtaBand({ title, sub, cta, href = "/sign-up", icon: Icon, className }: Props) {
  return (
    <div className={cn("relative overflow-hidden max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#09090B] ring-1 ring-white/10 rounded-2xl px-6 py-5 md:px-7 md:py-6 shadow-xl shadow-stone-900/20", className)}>
      <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" aria-hidden />
      <div className="relative flex items-center gap-4 text-center sm:text-left">
        {Icon && (
          <span className="hidden sm:flex w-10 h-10 rounded-xl bg-violet-600/20 ring-1 ring-violet-500/30 items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-violet-300" />
          </span>
        )}
        <div>
          <p className="text-[17px] md:text-[18px] font-bold text-white tracking-tight">{title}</p>
          <p className="text-[13px] text-stone-400 mt-0.5">{sub}</p>
        </div>
      </div>
      <Link href={href} className="relative shrink-0 flex items-center gap-2 bg-violet-600 text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-violet-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-900/40 transition-all">
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
