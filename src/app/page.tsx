"use client";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Sales Coach AI</h1>
      <p className="text-muted-foreground text-lg max-w-md">
        Votre copilote IA pour les calls de closing. Script builder + suggestions en temps réel.
      </p>
      <div className="flex gap-3">
        <SignUpButton mode="modal">
          <Button>Commencer</Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button variant="outline">Se connecter</Button>
        </SignInButton>
      </div>
    </main>
  );
}
