"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Loader2, FileText, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Script = {
  id: string;
  name: string;
  goal?: string | null;
  is_default?: boolean;
  archived_at?: string | null;
  duration_minutes?: number | null;
  steps: { count: number }[];
  objections: { count: number }[];
};

export function ScriptCard({ script }: { script: Script }) {
  const router = useRouter();
  const [settingDefault, setSettingDefault] = useState(false);

  async function handleSetDefault(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSettingDefault(true);
    try {
      await fetch(`/api/scripts/${script.id}/set-default`, { method: "POST" });
      router.refresh();
    } finally {
      setSettingDefault(false);
    }
  }

  return (
    <Link
      href={`/scripts/${script.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 hover:bg-stone-50 transition-colors"
    >
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
        script.is_default
          ? "bg-stone-900"
          : "bg-stone-100 group-hover:bg-stone-200"
      )}>
        <FileText className={cn("w-4 h-4", script.is_default ? "text-white" : "text-stone-500")} />
      </div>

      {/* Name + Goal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[13.5px] text-stone-900">{script.name}</span>
          {script.is_default && (
            <span className="text-[10px] bg-stone-900 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
              Par défaut
            </span>
          )}
        </div>
        {script.goal && (
          <p className="text-xs text-stone-400 mt-0.5 truncate">{script.goal}</p>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center shrink-0 text-xs text-stone-400 w-[220px]">
        <span className="flex items-center gap-1.5 tabular-nums w-[72px]">
          <FileText className="w-3 h-3 shrink-0" />
          {script.steps?.[0]?.count ?? 0} étapes
        </span>
        <span className="flex items-center gap-1.5 tabular-nums w-[90px]">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          {script.objections?.[0]?.count ?? 0} objections
        </span>
        <span className="flex items-center gap-1.5 tabular-nums w-[58px]">
          {script.duration_minutes ? (
            <><Clock className="w-3 h-3 shrink-0" />{script.duration_minutes} min</>
          ) : null}
        </span>
      </div>

      {/* Set default (hover only) — always reserves space */}
      <div className="w-7 shrink-0 flex items-center justify-center">
        {!script.is_default && !script.archived_at && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-stone-300 hover:text-amber-500 hover:bg-amber-50"
            onClick={handleSetDefault}
            disabled={settingDefault}
            title="Définir par défaut"
          >
            {settingDefault
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Star className="w-3.5 h-3.5" />
            }
          </Button>
        )}
      </div>
    </Link>
  );
}
