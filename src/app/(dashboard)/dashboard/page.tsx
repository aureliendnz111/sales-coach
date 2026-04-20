import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Clock } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const supabase = await createClient();

  const { count: scriptCount } = await supabase
    .from("scripts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId!)
    .is("archived_at", null);

  const firstName = user?.firstName ?? "vous";
  const count = scriptCount ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">
      <DashboardGreeting initialFirstName={firstName} />

      {count === 0 && (
        <div className="border border-amber-200 bg-amber-50/80 rounded-xl p-5 flex items-start gap-3.5">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">Créez votre premier script</p>
            <p className="text-amber-700/80 text-xs mt-0.5 mb-3 leading-relaxed">
              Importez votre process de vente pour que le copilote puisse vous assister en temps réel pendant vos calls.
            </p>
            <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs">
              <Link href="/scripts/new">Créer mon premier script</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Coming soon */}
      <div className="border border-stone-200 rounded-xl p-8 bg-white flex flex-col items-center justify-center gap-3 text-center min-h-[160px]">
        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
          <Clock className="w-5 h-5 text-stone-400" />
        </div>
        <p className="font-semibold text-stone-700 text-sm">Bientôt disponible</p>
        <p className="text-stone-400 text-xs max-w-xs leading-relaxed">
          Le dashboard affichera vos statistiques de calls, vos objections les plus fréquentes et vos performances de closing.
        </p>
      </div>
    </div>
  );
}
