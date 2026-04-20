"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Pencil, Check, X } from "lucide-react";

export function DashboardGreeting({ initialFirstName }: { initialFirstName: string }) {
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialFirstName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed) { setValue(initialFirstName); setEditing(false); return; }
    setSaving(true);
    try {
      await user?.update({ firstName: trimmed });
    } catch {}
    setSaving(false);
    setEditing(false);
  }

  function cancel() {
    setValue(user?.firstName ?? initialFirstName);
    setEditing(false);
  }

  return (
    <div>
      <div className="flex items-center gap-2 group">
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-[28px] font-semibold text-stone-900 tracking-tight">Bonjour</span>
            <input
              ref={inputRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              className="text-[28px] font-semibold text-stone-900 tracking-tight border-b-2 border-stone-400 bg-transparent outline-none w-40"
            />
            <button onClick={save} disabled={saving} className="text-stone-400 hover:text-stone-700 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={cancel} className="text-stone-400 hover:text-rose-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-[28px] font-semibold text-stone-900 tracking-tight">
              Bonjour {user?.firstName ?? value} 👋
            </h1>
            <button
              onClick={() => { setValue(user?.firstName ?? value); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-stone-600"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
      <p className="mt-1.5 text-stone-500 text-sm">Votre copilote IA pour les calls de closing.</p>
    </div>
  );
}
