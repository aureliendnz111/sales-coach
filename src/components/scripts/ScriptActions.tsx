"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArchiveIcon, Trash2, Loader2, MoreHorizontal, ArchiveRestore, Star, Copy } from "lucide-react";

type Props = { scriptId: string; isArchived: boolean; isDefault: boolean };

export function ScriptActions({ scriptId, isArchived, isDefault }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<"archive" | "delete" | "unarchive" | null>(null);
  const [loading, setLoading] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function duplicate() {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/scripts/${scriptId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/scripts/${data.scriptId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDuplicating(false);
    }
  }

  async function setDefault() {
    setSettingDefault(true);
    try {
      const res = await fetch(`/api/scripts/${scriptId}/set-default`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.refresh();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSettingDefault(false);
    }
  }

  async function execute() {
    setLoading(true);
    setError(null);
    try {
      if (confirm === "archive") {
        const res = await fetch(`/api/scripts/${scriptId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archive: true }) });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        router.push("/scripts");
        router.refresh();
      } else if (confirm === "unarchive") {
        const res = await fetch(`/api/scripts/${scriptId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: { _unarchive: true } }) });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        router.refresh();
        setOpen(false);
      } else if (confirm === "delete") {
        const res = await fetch(`/api/scripts/${scriptId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archive: false }) });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        router.push("/scripts");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <MoreHorizontal className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          {!confirm ? (
            <>
              <DialogHeader><DialogTitle>Actions</DialogTitle></DialogHeader>
              <div className="space-y-2 py-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={duplicate} disabled={duplicating}>
                  {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  Dupliquer
                </Button>
                {!isDefault && !isArchived && (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={setDefault} disabled={settingDefault}>
                    {settingDefault ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                    Définir comme script par défaut
                  </Button>
                )}
                {isArchived ? (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setConfirm("unarchive")}>
                    <ArchiveRestore className="w-4 h-4" /> Désarchiver
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setConfirm("archive")}>
                    <ArchiveIcon className="w-4 h-4" /> Archiver
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => setConfirm("delete")}>
                  <Trash2 className="w-4 h-4" /> Supprimer définitivement
                </Button>
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {confirm === "delete" ? "Supprimer ce script ?" : confirm === "archive" ? "Archiver ce script ?" : "Désarchiver ce script ?"}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {confirm === "delete"
                  ? "Cette action est irréversible. Le script et toutes ses étapes seront supprimés définitivement."
                  : confirm === "archive"
                  ? "Le script sera masqué de la liste mais restera accessible depuis les archives."
                  : "Le script sera remis dans ta liste active."}
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setConfirm(null)} disabled={loading}>Annuler</Button>
                <Button variant={confirm === "delete" ? "destructive" : "default"} onClick={execute} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Confirmer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
