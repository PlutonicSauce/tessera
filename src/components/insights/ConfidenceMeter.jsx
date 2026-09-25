const LEVEL = { low: 1, medium: 2, high: 3 };

export default function ConfidenceMeter({ value }) {
  const n = LEVEL[value] || 2;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground" title={`${value} confidence`}>
      <span className="flex items-end gap-[2px]">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-[3px] rounded-sm ${i <= n ? "bg-foreground" : "bg-border"}`} style={{ height: 4 + i * 3 }} />
        ))}
      </span>
      <span className="capitalize">{value}</span>
    </span>
  );
}