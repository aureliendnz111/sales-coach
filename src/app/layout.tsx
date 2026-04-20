import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider, Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/provider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sales Coach AI",
  description: "Votre copilote IA pour les calls de closing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full bg-background text-foreground">
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
