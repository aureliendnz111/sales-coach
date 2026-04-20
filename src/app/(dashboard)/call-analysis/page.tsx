import { PhoneCall } from "lucide-react";

export default function CallAnalysisPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center px-8">
      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mb-5">
        <PhoneCall className="w-7 h-7 text-stone-400" />
      </div>
      <h1 className="text-xl font-semibold text-stone-900 mb-2">Analyse de calls</h1>
      <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
        Relisez vos calls passés, visualisez les étapes franchies, les objections traitées et votre score de closing.
      </p>
      <span className="mt-5 text-xs bg-stone-100 text-stone-500 px-3 py-1.5 rounded-full font-medium">
        Bientôt disponible
      </span>
    </div>
  );
}
