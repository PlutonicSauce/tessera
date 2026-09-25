import { Link, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BrandMark from "@/components/shared/BrandMark";

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark />
            <span className="font-display text-[26px] leading-none tracking-tight">Tessera</span>
            <span className="ml-1 hidden border-l border-border pl-3 eyebrow sm:inline">Policy &amp; Public Sentiment</span>
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/70 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-display text-base italic text-foreground/80">AI drafts. Analysts decide.</span>
          <span>Live data · Federal Register · GovInfo · Regulations.gov · GDELT</span>
        </div>
      </footer>
    </div>
  );
}