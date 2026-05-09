"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Clock, Archive, ArchiveX, Trash2, Loader2, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

type Session = {
  id: string;
  script_id: string | null;
  script_name: string;
  persona_id: string | null;
  persona_name: string | null;
  duration_seconds: number;
  created_at: string;
  archived_at: string | null;
};

const PERSONA_EMOJI: Record<string, string> = {
  sophie: "👩‍💼", marc: "👨‍💻", lucie: "👩‍🦱", thomas: "👨‍💼",
};

function formatDuration(s: number) {
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m} min ${rem} sec` : `${m} min`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/playground/sessions/${id}`)
      .then(r => r.json())
      .then(d => setSession(d.session ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleArchive() {
    if (!session) return;
    setArchiving(true);
    const archived = !session.archived_at;
    await fetch(`/api/playground/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    setSession(s => s ? { ...s, archived_at: archived ? new Date().toISOString() : null } : s);
    setArchiving(false);
  }

  async function deleteSession() {
    setDeleting(true);
    await fetch(`/api/playground/sessions/${id}`, { method: "DELETE" });
    router.push("/playground");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 animate-spin text-stone-300" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-10">
        <button onClick={() => router.push("/playground")} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" /> Playground
        </button>
        <p className="text-stone-400">Session introuvable.</p>
      </div>
    );
  }

  const emoji = session.persona_id ? (PERSONA_EMOJI[session.persona_id] ?? "🧑‍💼") : "🧑‍💼";
  const isArchived = !!session.archived_at;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push("/playground")}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Playground
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-3xl shrink-0">
              {emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-[20px] font-semibold text-stone-900 tracking-tight">
                  {session.persona_name ?? "Prospect IA"}
                </h1>
                {isArchived && (
                  <span className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full font-medium">Archivé</span>
                )}
              </div>
              <p className="text-sm text-stone-500">{session.script_name}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  <Clock className="w-3 h-3" /> {formatDuration(session.duration_seconds)}
                </span>
                <span className="text-stone-200">·</span>
                <span className="text-xs text-stone-400">{formatDate(session.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleArchive}
              disabled={archiving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50"
            >
              {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isArchived ? <ArchiveX className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
              {isArchived ? "Désarchiver" : "Archiver"}
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-500">Confirmer ?</span>
                <button onClick={deleteSession} disabled={deleting} className="px-2.5 py-1.5 text-xs text-white bg-rose-500 hover:bg-rose-400 rounded-lg transition-colors disabled:opacity-50">
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Oui"}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1.5 text-xs text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replay placeholder */}
      <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Replay</p>
        </div>
        <div className="px-5 py-12 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
            <Swords className="w-6 h-6 text-stone-300" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-stone-600">Transcript & score bientôt disponibles</p>
            <p className="text-sm text-stone-400 mt-1 max-w-xs leading-relaxed">
              La transcription et le score de cet appel seront affichés ici dès que le système vocal sera activé.
            </p>
          </div>
        </div>
      </div>

      {/* Session info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Script", value: session.script_name },
          { label: "Durée", value: formatDuration(session.duration_seconds) },
          { label: "Date", value: new Date(session.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) },
        ].map(({ label, value }) => (
          <div key={label} className="border border-stone-200 rounded-xl px-4 py-3 bg-white">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-[13px] font-medium text-stone-800 truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
