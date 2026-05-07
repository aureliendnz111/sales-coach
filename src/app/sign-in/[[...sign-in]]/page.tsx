import { SignIn } from "@clerk/nextjs";
import { RumiosLogo } from "@/components/RumiosLogo";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
        <RumiosLogo size={22} />
        <span className="font-semibold text-[14px] text-stone-800 tracking-tight">RUMIOS</span>
      </Link>
      <SignIn />
      <p className="mt-6 text-[13px] text-stone-400">
        Pas encore de compte ?{" "}
        <Link href="/sign-up" className="text-stone-700 font-medium hover:underline cursor-pointer">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
