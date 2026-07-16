"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";

type Dest = { label: string; count: number; coords: [number, number] };

const W = 820;
const H = 440;

/** Interactive world map: real country shapes + destination markers. Hover or
 *  tap a marker (or a legend chip) to highlight it and reveal label + count. */
export default function WorldMap({
  destinations,
  accent = "#35e0ff",
}: {
  destinations: Dest[];
  accent?: string;
}) {
  const { features, projection, pathGen } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fc = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
    const projection = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [W - 8, H - 8],
      ],
      fc,
    );
    return { features: fc.features as unknown[], projection, pathGen: geoPath(projection) };
  }, []);

  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(...destinations.map((d) => d.count), 1);
  const radius = (c: number) => 5 + (c / max) * 15;

  const set = (label: string | null) => setActive(label);
  const toggle = (label: string) => setActive((a) => (a === label ? null : label));

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label="Wereldkaart met vakantiebestemmingen"
      >
        {/* countries */}
        <g>
          {features.map((f, i) => (
            <path
              key={i}
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              d={pathGen(f as any) ?? undefined}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={0.4}
            />
          ))}
        </g>

        {/* destination markers */}
        {destinations.map((dst) => {
          const xy = projection(dst.coords);
          if (!xy) return null;
          const [x, y] = xy;
          const isActive = active === dst.label;
          const dim = active !== null && !isActive;
          const flip = x > W * 0.68; // draw label on the left near the right edge
          const rr = radius(dst.count);
          const labelText = `${dst.label} · ${dst.count}`;
          const boxW = labelText.length * 7 + 20;
          return (
            <g
              key={dst.label}
              onMouseEnter={() => set(dst.label)}
              onMouseLeave={() => setActive((a) => (a === dst.label ? null : a))}
              onClick={() => toggle(dst.label)}
              style={{ cursor: "pointer" }}
            >
              {/* larger invisible hit area for touch */}
              <circle cx={x} cy={y} r={rr + 12} fill="transparent" />
              <motion.circle
                cx={x}
                cy={y}
                r={rr}
                fill={accent}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isActive ? 1.4 : 1, opacity: dim ? 0.4 : 0.92 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
              {isActive && (
                <g pointerEvents="none">
                  <rect
                    x={flip ? x - rr - boxW - 6 : x + rr + 6}
                    y={y - 12}
                    width={boxW}
                    height={24}
                    rx={12}
                    fill="rgba(0,0,0,0.8)"
                    stroke={accent}
                    strokeWidth={0.75}
                  />
                  <text
                    x={flip ? x - rr - boxW / 2 - 6 : x + rr + boxW / 2 + 6}
                    y={y + 1}
                    fill="#fff"
                    fontSize={12.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="display"
                  >
                    {labelText}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* legend — hover/tap to highlight on the map */}
      <div className="flex flex-wrap justify-center gap-2">
        {destinations.map((dst) => {
          const isActive = active === dst.label;
          return (
            <button
              key={dst.label}
              onMouseEnter={() => set(dst.label)}
              onMouseLeave={() => setActive((a) => (a === dst.label ? null : a))}
              onClick={() => toggle(dst.label)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                isActive ? "border-transparent text-black" : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
              style={isActive ? { background: accent } : undefined}
            >
              <span>{dst.label}</span>
              <span className="display tabular-nums opacity-80">{dst.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
