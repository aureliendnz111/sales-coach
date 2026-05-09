"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Clock, ShieldAlert, Star, Archive, ArchiveX, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

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
  const { lang } = useLang();
  const [settingDefault, setSettingDefault] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isArchived = !!script.archived_at;

  async function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDuplicating(true);
    const res = await fetch(`/api/scripts/${script.id}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (data.scriptId) router.push(`/scripts/${data.scriptId}`);
    setDuplicating(false);
  }

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

  async function handleArchive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setArchiving(true);
    await fetch(`/api/scripts/${script.id}`, {
      method: isArchived ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isArchived ? { script: { _unarchive: true } } : { archive: true }),
    });
    router.refresh();
    setArchiving(false);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    await fetch(`/api/scripts/${script.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archive: false }),
    });
    router.refresh();
    setDeleting(false);
  }

  return (
    <div
      onClick={() => router.push(`/scripts/${script.id}`)}
      className="group flex items-center gap-4 px-4 py-3.5 hover:bg-stone-50 transition-colors cursor-pointer"
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
        script.is_default ? "bg-violet-600" : "bg-stone-100 group-hover:bg-violet-50"
      )}>
        <FileText className={cn("w-4 h-4", script.is_default ? "text-white" : "text-stone-500 group-hover:text-violet-500")} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[13.5px] text-stone-900">{script.name}</span>
          {script.is_default && (
            <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
              {i18n.common.default_[lang]}
            </span>
          )}
        </div>
        {script.goal && (
          <p className="text-xs text-stone-400 mt-0.5 truncate">{script.goal}</p>
        )}
      </div>

      <div className="hidden sm:flex items-center shrink-0 text-xs text-stone-400 w-[220px]">
        <span className="flex items-center gap-1.5 tabular-nums w-[72px]">
          <FileText className="w-3 h-3 shrink-0" />
          {script.steps?.[0]?.count ?? 0} {i18n.scripts.steps[lang]}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums w-[90px]">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          {script.objections?.[0]?.count ?? 0} {i18n.scripts.objections[lang]}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums w-[58px]">
          {script.duration_minutes ? (
            <><Clock className="w-3 h-3 shrink-0" />{script.duration_minutes} min</>
          ) : null}
        </span>
      </div>

      {/* Hover actions */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleDuplicate}
          disabled={duplicating}
          title="Dupliquer"
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        {!script.is_default && !isArchived && (
          <button
            onClick={handleSetDefault}
            disabled={settingDefault}
            title={i18n.scripts.setDefault[lang]}
            className="p-1.5 rounded-lg text-stone-300 hover:text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            {settingDefault ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
          </button>
        )}
        <button
          onClick={handleArchive}
          disabled={archiving}
          title={isArchived ? i18n.playground.unarchive[lang] : i18n.playground.archive[lang]}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isArchived ? <ArchiveX className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          title={i18n.playground.delete_[lang]}
          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
