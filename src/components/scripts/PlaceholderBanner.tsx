"use client";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

export function PlaceholderBanner({ scriptId }: { scriptId: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900">Ce script contient des placeholders à personnaliser</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Remplace les zones entre crochets <span className="font-mono bg-amber-100 px-1 rounded">[comme celle-ci]</span> par le contenu de ton offre.{" "}
          <Link href={`/scripts/${scriptId}/edit`} className="underline underline-offset-2 hover:text-amber-900">
            Modifier le script
          </Link>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-700 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
