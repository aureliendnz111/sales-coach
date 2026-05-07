"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.toUpperCase() === "MADONNA") {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `rumios_access=granted; path=/; expires=${expires.toUTCString()}`;
      const params = new URLSearchParams(window.location.search);
      router.push(params.get("next") || "/");
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
            <span className="text-white text-[16px] font-bold">R</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[15px] text-stone-900">RUMIOS</p>
            <p className="text-[13px] text-stone-400 mt-0.5">Accès privé</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            placeholder="Code d'accès"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 text-[14px] text-stone-900 placeholder-stone-400 outline-none transition-colors ${
              error
                ? "border-rose-300 bg-rose-50"
                : "border-stone-200 bg-stone-50 focus:border-stone-400 focus:bg-white"
            }`}
          />
          {error && (
            <p className="text-[12px] text-rose-500 text-center">Code incorrect.</p>
          )}
          <button
            type="submit"
            className="w-full bg-stone-900 text-white text-[14px] font-medium py-3 rounded-xl hover:bg-stone-700 transition-colors"
          >
            Accéder
          </button>
        </form>
      </div>
    </div>
  );
}
