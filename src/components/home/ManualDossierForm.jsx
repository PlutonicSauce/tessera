import { useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TYPE_LABEL } from "@/lib/evidence";
import { toast } from "@/components/ui/use-toast";

const EXCERPT = 16000;

export default function ManualDossierForm({ onCreated }) {
  const [f, setF] = useState({ title: "", policy_type: "bill", agency: "", docket_id: "", text: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target?.value ?? e });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let policy_text_uri = "";
      if (f.text.length > EXCERPT) {
        const file = new File([f.text], "policy.txt", { type: "text/plain" });
        policy_text_uri = (await base44.integrations.Core.UploadPrivateFile({ file })).file_uri;
      }
      const d = await base44.entities.Dossier.create({
        title: f.title, policy_type: f.policy_type, agency: f.agency, docket_id: f.docket_id.trim(),
        policy_text: f.text.slice(0, EXCERPT), policy_text_uri, full_text_length: f.text.length, status: "gathering",
      });
      onCreated(d);
    } catch (err) {
      toast({ title: "Could not create dossier", description: err.message, variant: "destructive" });
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5"><Label>Title</Label><Input required value={f.title} onChange={set("title")} placeholder="e.g. Virginia HB 1234 — Broadband Access Act" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={f.policy_type} onValueChange={set("policy_type")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Agency / sponsor</Label><Input value={f.agency} onChange={set("agency")} /></div>
      </div>
      <div className="space-y-1.5"><Label>Regulations.gov docket ID <span className="text-muted-foreground">(optional)</span></Label><Input value={f.docket_id} onChange={set("docket_id")} placeholder="e.g. EPA-HQ-OW-2022-0114" className="font-mono" /></div>
      <div className="space-y-1.5">
        <Label>Policy text</Label>
        <Textarea required value={f.text} onChange={set("text")} rows={9} className="font-serif text-[15px]" placeholder="Paste the bill, rule or regulation text…" />
        <p className="text-xs text-muted-foreground">{f.text.length.toLocaleString()} characters · long texts are stored privately in full</p>
      </div>
      <Button type="submit" disabled={saving} className="h-11 w-full rounded-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create dossier"}
      </Button>
    </form>
  );
}