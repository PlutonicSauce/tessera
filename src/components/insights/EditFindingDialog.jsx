import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditFindingDialog({ open, onOpenChange, finding, onSave }) {
  const [f, setF] = useState({ title: "", detail: "", analyst_note: "" });
  useEffect(() => {
    if (open) setF({ title: finding.title || "", detail: finding.detail || "", analyst_note: finding.analyst_note || "" });
  }, [open, finding]);

  const save = async (e) => {
    e.preventDefault();
    await onSave(f);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">Edit & approve</DialogTitle>
          <DialogDescription>Your wording and notes take precedence over the AI draft in every briefing.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>Finding</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Detail</Label><Textarea rows={5} value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} className="font-serif text-[15px]" /></div>
          <div className="space-y-1.5"><Label>Analyst note</Label><Textarea rows={3} value={f.analyst_note} onChange={(e) => setF({ ...f, analyst_note: e.target.value })} placeholder="Context, caveats, or disagreement with the AI draft" /></div>
          <Button type="submit" className="h-11 w-full rounded-full">Save & approve</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}