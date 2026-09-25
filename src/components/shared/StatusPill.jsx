const STATUS = {
  gathering: { label: "Gathering evidence", cls: "bg-muted text-muted-foreground" },
  in_review: { label: "In analyst review", cls: "bg-[#B45309]/10 text-[#B45309]" },
  briefed: { label: "Briefed", cls: "bg-[#0F766E]/10 text-[#0F766E]" },
};

export default function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.gathering;
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium normal-case tracking-normal ${s.cls}`}>{s.label}</span>;
}