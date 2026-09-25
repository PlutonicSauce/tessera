import { Sparkles } from "lucide-react";

export default function AIBlock({ label = "AI interpretation", children, className = "" }) {
  return (
    <div className={`rounded-xl border border-dashed border-[#6D28D9]/35 bg-[#6D28D9]/[0.03] p-5 ${className}`}>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6D28D9]">
        <Sparkles className="h-3.5 w-3.5" />
        {label}
        <span className="ml-auto normal-case tracking-normal text-[#6D28D9]/70">Verify before use</span>
      </div>
      {children}
    </div>
  );
}