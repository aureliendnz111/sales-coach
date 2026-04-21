"use client";
import { useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Check, Loader2, Eye, EyeOff, LogOut, User, Lock, AlertTriangle, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-stone-100">
        <h2 className="text-[13px] font-semibold text-stone-700">{title}</h2>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-6">
      <label className="w-28 shrink-0 text-[13px] text-stone-500 pt-2">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={type === "password" ? (show ? "text" : "password") : type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full text-[13px] border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 disabled:bg-stone-50 disabled:text-stone-400 transition-colors"
      />
      {type === "password" && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

function SaveButton({ loading, saved, onClick }: { loading: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || saved}
      className="flex items-center gap-1.5 text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : null}
      {saved ? "Enregistré" : "Enregistrer"}
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function uploadAvatar(file: File) {
    if (!user) return;
    setAvatarUploading(true);
    try {
      await user.setProfileImage({ file });
    } catch {}
    setAvatarUploading(false);
  }

  async function saveProfile() {
    if (!user) return;
    setProfileSaving(true);
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {}
    setProfileSaving(false);
  }

  async function savePassword() {
    setPasswordError("");
    if (newPassword !== confirmPassword) { setPasswordError("Les mots de passe ne correspondent pas."); return; }
    if (newPassword.length < 8) { setPasswordError("Le mot de passe doit faire au moins 8 caractères."); return; }
    if (!user) return;
    setPasswordSaving(true);
    try {
      await user.updatePassword({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors du changement de mot de passe.";
      setPasswordError(msg);
    }
    setPasswordSaving(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-stone-900 tracking-tight">Paramètres</h1>
        <p className="text-sm text-stone-500 mt-0.5">Gérez votre profil et votre sécurité.</p>
      </div>

      <Section title={<span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Profil</span> as unknown as string}>
        <Field label="Photo">
          <div className="flex items-center gap-4">
            <div className="relative group w-14 h-14 shrink-0">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
                : (
                  <div className="w-14 h-14 rounded-full bg-stone-900 text-white text-lg font-bold flex items-center justify-center">
                    {[user?.firstName, user?.lastName].filter(Boolean).map(n => n![0]).join("").toUpperCase() || "?"}
                  </div>
                )
              }
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                {avatarUploading ? "Envoi…" : "Changer la photo"}
              </button>
              <p className="text-[11px] text-stone-500">JPG, PNG ou GIF — max 10 Mo</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
            />
          </div>
        </Field>
        <Field label="Prénom">
          <Input value={firstName} onChange={setFirstName} placeholder="Votre prénom" />
        </Field>
        <Field label="Nom">
          <Input value={lastName} onChange={setLastName} placeholder="Votre nom" />
        </Field>
        <Field label="Email">
          <Input value={user?.emailAddresses[0]?.emailAddress ?? ""} disabled />
          <p className="text-[11px] text-stone-500 mt-1">L'email ne peut pas être modifié ici.</p>
        </Field>
        <div className="flex justify-end pt-1">
          <SaveButton loading={profileSaving} saved={profileSaved} onClick={saveProfile} />
        </div>
      </Section>

      <Section title={<span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" />Mot de passe</span> as unknown as string}>
        <Field label="Actuel">
          <Input type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
        </Field>
        <Field label="Nouveau">
          <Input type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
        </Field>
        <Field label="Confirmer">
          <Input type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
        </Field>
        {passwordError && (
          <div className="flex items-center gap-2 text-[12.5px] text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {passwordError}
          </div>
        )}
        <div className="flex justify-end pt-1">
          <SaveButton loading={passwordSaving} saved={passwordSaved} onClick={savePassword} />
        </div>
      </Section>

      <Section title={<span className="flex items-center gap-1.5 text-rose-600"><LogOut className="w-3.5 h-3.5" />Session</span> as unknown as string}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-stone-700 font-medium">Se déconnecter</p>
            <p className="text-[12px] text-stone-500">Vous serez redirigé vers la page d'accueil.</p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="text-[12.5px] font-medium px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </Section>
    </div>
  );
}
