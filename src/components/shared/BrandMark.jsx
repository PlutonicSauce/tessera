export default function BrandMark({ size = 22 }) {
  const tiles = ["#2B45B8", "#0F766E", "#B45309", "#6D28D9"];
  return (
    <span className="grid grid-cols-2 gap-[2px]" style={{ width: size, height: size }} aria-hidden>
      {tiles.map((c, i) => (
        <span key={c} className="rounded-[2px]" style={{ background: c, opacity: i === 3 ? 0.85 : 1 }} />
      ))}
    </span>
  );
}