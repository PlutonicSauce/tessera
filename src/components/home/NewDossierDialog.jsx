import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FederalRegisterSearch from "@/components/home/FederalRegisterSearch";
import ManualDossierForm from "@/components/home/ManualDossierForm";

export default function NewDossierDialog({ open, onOpenChange, onCreated }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl p-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
        <div className="p-7 pb-0">
          <DialogHeader>
            <DialogTitle className="font-display text-4xl font-normal text-foreground">New policy dossier</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">Start from authoritative text. Evidence is added next.</DialogDescription>
          </DialogHeader>
        </div>
        <Tabs defaultValue="fr" className="px-7 pb-7">
          <TabsList className="mt-5 grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="fr" className="rounded-full">Federal Register (live)</TabsTrigger>
            <TabsTrigger value="manual" className="rounded-full">Paste policy text</TabsTrigger>
          </TabsList>
          <TabsContent value="fr" className="mt-6">
            <FederalRegisterSearch onCreated={onCreated} />
          </TabsContent>
          <TabsContent value="manual" className="mt-6">
            <ManualDossierForm onCreated={onCreated} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}