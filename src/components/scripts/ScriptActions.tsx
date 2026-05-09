"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2, Loader2, Copy, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang-context";
import { i18n } from "@/lib/i18n";

type Props = { scriptId: string; isArchived: boolean; isDefault: boolean };

export function ScriptActions({ scriptId, isArchived, isDefault }: Props) {
  const router = useRouter();
  const { lang } = useLang();
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleArchive() {
    setArchiving(true);
    if (isArchived) {
      await fetch(`/api/scripts/${scriptId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: { _unarchive: true } }) });
    } else {
      await fetch(`/api/scripts/${scriptId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archive: true }) });
    }
    router.refresh();
    setArchiving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/scripts/${scriptId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archive: false }) });
    router.push("/scripts");
    router.refresh();
  }

  async function handleDuplicate() {
    setDuplicating(true);
    const res = await fetch(`/api/scripts/${scriptId}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (data.scriptId) router.push(`/scripts/${data.scriptId}`);
    setDuplicating(false);
  }

  async function handleSetDefault() {
    setSettingDefault(true);
    await fetch(`/api/scripts/${scriptId}/set-default`, { method: "POST" });
    router.refresh();
    setSettingDefault(false);
  }

  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-all disabled:opacity-50";

  return (
    <div className="flex items-center gap-2">
      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        disabled={duplicating}
        className={cn(btnBase, "text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300")}
      >
        {duplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
        Dupliquer
      </button>

      {/* Set default */}
      {!isDefault && !isArchived && (
        <button
          onClick={handleSetDefault}
          disabled={settingDefault}
          className={cn(btnBase, "text-stone-500 border-stone-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600")}
        >
          {settingDefault ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
          {i18n.scripts.setDefault[lang]}
        </button>
      )}

      {/* Archive / Unarchive */}
      <button
        onClick={handleArchive}
        disabled={archiving}
        className={cn(btnBase, "text-stone-500 border-stone-200 hover:bg-stone-50 hover:border-stone-300")}
      >
        {archiving
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
        {isArchived ? i18n.playground.unarchive[lang] : i18n.playground.archive[lang]}
      </button>

      {/* Delete */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className={cn(btnBase, "text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300")}
        >
          <Trash2 className="w-3.5 h-3.5" /> {i18n.playground.delete_[lang]}
        </button>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-stone-500">{i18n.playground.confirmQ[lang]}</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-2.5 py-1.5 text-xs text-white bg-rose-500 hover:bg-rose-400 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : i18n.playground.yes[lang]}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-2.5 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {i18n.common.cancel[lang]}
          </button>
        </div>
      )}
    </div>
  );
}
