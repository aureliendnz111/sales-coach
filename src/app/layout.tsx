import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/provider";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RUMIOS",
  description: "Votre copilote IA pour les calls de closing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={{
        signIn: {
          start: {
            title: "Se connecter à Rumios",
            subtitle: "Bienvenue, entrez vos informations ci-dessous.",
          },
        },
        signUp: {
          start: {
            title: "Créer un compte Rumios",
            subtitle: "Commencez gratuitement, sans carte bancaire.",
          },
        },
      }}
      appearance={{
        variables: {
          colorPrimary: "#18181b",
          colorBackground: "#ffffff",
          colorText: "#1c1917",
          colorTextSecondary: "#78716c",
          colorInputBackground: "#fafaf9",
          colorInputText: "#1c1917",
          colorDanger: "#e11d48",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: "14px",
        },
        elements: {
          card: { boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e7e5e4" },
          headerTitle: { fontSize: "18px", fontWeight: "700", color: "#1c1917" },
          headerSubtitle: { fontSize: "13px", color: "#78716c" },
          socialButtonsBlockButton__google: { display: "none" },
          socialButtonsProviderIcon__google: { display: "none" },
          formButtonPrimary: { backgroundColor: "#18181b", fontSize: "13.5px", fontWeight: "500", "&:hover": { backgroundColor: "#3f3f46" } },
          formFieldInput: { fontSize: "13.5px", borderColor: "#e7e5e4", "&:focus": { borderColor: "#18181b", boxShadow: "none" } },
          formFieldLabel: { fontSize: "12.5px", fontWeight: "500", color: "#44403c" },
          footerPages: { display: "none" },
          identityPreviewEditButton: { color: "#18181b" },
          dividerLine: { backgroundColor: "#f5f5f4" },
          dividerText: { color: "#a8a29e", fontSize: "12px" },
        },
      }}
    >
      <html lang="fr" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full bg-background text-foreground">
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
