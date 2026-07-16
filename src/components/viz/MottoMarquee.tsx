"use client";

type Quote = { name: string; text: string };

const PALETTE = ["#c6ff3d", "#ff3d81", "#35e0ff", "#ffd23d", "#7b5cff", "#ff8a3d"];

function Row({
  items,
  direction,
  duration,
  offset,
}: {
  items: Quote[];
  direction: "left" | "right";
  duration: number;
  offset: number;
}) {
  // duplicate the list so the loop is seamless
  const loop = [...items, ...items];
  return (
    <div className="marquee">
      <div
        className="marquee-track"
        style={{
          animation: `marquee-${direction} ${duration}s linear infinite`,
        }}
      >
        {loop.map((q, i) => {
          const color = PALETTE[(i + offset) % PALETTE.length];
          return (
            <span
              key={`${q.name}-${i}`}
              className="flex shrink-0 items-center gap-3 rounded-full border px-5 py-2.5 text-sm transition-transform hover:scale-105 sm:text-base"
              style={{ borderColor: `${color}66`, background: `${color}12` }}
            >
              <span className="display" style={{ color }}>
                “{q.text}”
              </span>
              <span className="text-xs uppercase tracking-widest opacity-55">{q.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function MottoMarquee({ mottos }: { mottos: Quote[] }) {
  // keep pill-sized mottos, distribute round-robin over 3 rows
  const pool = mottos.filter((m) => m.text.length <= 70).slice(0, 45);
  const rows: Quote[][] = [[], [], []];
  pool.forEach((m, i) => rows[i % 3].push(m));

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <Row items={rows[0]} direction="left" duration={38} offset={0} />
      <Row items={rows[1]} direction="right" duration={46} offset={2} />
      <Row items={rows[2]} direction="left" duration={42} offset={4} />
    </div>
  );
}
