import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { title: string; sub: string; cta: string; href?: string; icon?: LucideIcon; className?: string };

// Gradient call-to-action strip used between landing sections.
export function CtaBand({ title, sub, cta, href = "/sign-up", icon: Icon, className }: Props) {
  return (
    <div className={cn("relative overflow-hidden max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-7 py-8 md:px-9 md:py-9 shadow-xl shadow-violet-900/20", className)}>
      <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" aria-hidden />
      <div className="relative flex items-center gap-4 text-center sm:text-left">
        {Icon && (
          <span className="hidden sm:flex w-11 h-11 rounded-xl bg-white/15 items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </span>
        )}
        <div>
          <p className="text-[18px] md:text-[20px] font-bold text-white tracking-tight">{title}</p>
          <p className="text-[13px] text-violet-100/80 mt-1">{sub}</p>
        </div>
      </div>
      <Link href={href} className="relative shrink-0 flex items-center gap-2 bg-white text-violet-700 text-[14px] font-semibold px-5 py-3 rounded-lg hover:bg-violet-50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-950/30 transition-all">
        {cta} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
