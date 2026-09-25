import { Link, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { tessera } from "@/api/tesseraClient";
import BrandMark from "@/components/shared/BrandMark";

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-mesh">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="transition-transform duration-300 group-hover:scale-110">
              <BrandMark />
            </div>
            <span className="font-display text-[26px] leading-none tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Tessera</span>
            <span className="ml-1 hidden border-l border-border/50 pl-3 eyebrow sm:inline">Policy &amp; Public Sentiment</span>
          </Link>
          <button
            onClick={() => tessera.auth.logout()}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-all duration-300 hover:bg-white/10 hover:text-foreground hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 bg-background/40 backdrop-blur-md print:hidden relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-display text-base italic text-foreground/80">AI drafts. Analysts decide.</span>
          <div className="flex flex-col items-end gap-1 text-right">
            <span>Powered by <strong>Microsoft Foundry</strong>, <strong>Azure AI Search</strong>, &amp; <strong>Microsoft Fabric</strong></span>
            <span className="opacity-70">Live data · Federal Register · Regulations.gov API · GovInfo · GDELT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}