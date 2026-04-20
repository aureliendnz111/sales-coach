import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center px-8">
      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-5">
        <BarChart2 className="w-7 h-7 text-stone-400" />
      </div>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Analytics</h1>
      <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
        Taux de closing, objections les plus fréquentes, durée moyenne par étape — toutes vos métriques de vente en un coup d'œil.
      </p>
      <span className="mt-5 text-xs bg-stone-100 text-stone-500 px-3 py-1.5 rounded-full font-medium">
        Bientôt disponible
      </span>
    </div>
  );
}
