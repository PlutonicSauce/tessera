import { useState } from "react";
import { Loader2, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLASS_META, CHANNEL_LABEL, AUTHOR_LABEL } from "@/lib/evidence";
import { redactPII } from "@/lib/redact";
import { createSources } from "@/lib/sources";

const EMPTY = { evidence_class: "public_opinion", channel: "correspondence", author_type: "individual", outlet: "", url: "", published_date: "", title: "", content: "", split: false };

function Pick({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{Object.entries(options).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function AddSourceDialog({ open, onOpenChange, dossier, sources, onDone }) {
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v?.target ? v.target.value : v });

  const parts = (f.split ? f.content.split(/\n\s*\n/) : [f.content]).map((t) => t.trim()).filter(Boolean);
  const piiCount = parts.reduce((n, p) => n + redactPII(p).count, 0);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { split, ...base } = f;
    const records = parts.map((p, i) => {
      const { text, count } = redactPII(p.slice(0, 8000));
      return { ...base, dossier_id: dossier.id, title: parts.length > 1 ? `${f.title || CHANNEL_LABEL[f.channel]} #${i + 1}` : f.title, content: text, pii_redactions: count, origin: "manual" };
    });
    await createSources(sources, records);
    setSaving(false);
    setF(EMPTY);
    onOpenChange(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">Add evidence</DialogTitle>
          <DialogDescription>Surveys, letters, call transcripts, social posts, hearing testimony or articles.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Pick label="Evidence class" value={f.evidence_class} onChange={set("evidence_class")} options={{ policy_text: CLASS_META.policy_text.label, reporting: CLASS_META.reporting.label, public_opinion: CLASS_META.public_opinion.label }} />
            <Pick label="Channel" value={f.channel} onChange={set("channel")} options={CHANNEL_LABEL} />
            <Pick label="Submitter type" value={f.author_type} onChange={set("author_type")} options={AUTHOR_LABEL} />
            <div className="space-y-1.5"><Label>Outlet / platform</Label><Input value={f.outlet} onChange={set("outlet")} placeholder="e.g. 311 line, Reddit" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={f.title} onChange={set("title")} /></div>
            <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={f.published_date} onChange={set("published_date")} /></div>
          </div>
          <div className="space-y-1.5"><Label>Link</Label><Input value={f.url} onChange={set("url")} placeholder="https://" /></div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <Textarea required rows={7} value={f.content} onChange={set("content")} className="font-serif text-[15px]" />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <label className="flex items-center gap-2"><Checkbox checked={f.split} onCheckedChange={set("split")} />Split into separate entries at blank lines</label>
              <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" />{parts.length} entr{parts.length === 1 ? "y" : "ies"} · {piiCount} personal detail{piiCount === 1 ? "" : "s"} will be redacted</span>
            </div>
          </div>
          <Button type="submit" disabled={saving || !parts.length} className="h-11 w-full rounded-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : `Add ${parts.length || ""} to evidence`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}