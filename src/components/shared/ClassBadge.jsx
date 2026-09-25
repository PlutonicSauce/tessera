import { CLASS_META } from "@/lib/evidence";

export default function ClassBadge({ cls, label, className = "" }) {
  const m = CLASS_META[cls] || CLASS_META.ai;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${m.soft} ${m.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {label || m.label}
    </span>
  );
}