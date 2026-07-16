"use client";

import type { GeoPath, GeoPermissibleObjects, GeoProjection } from "d3-geo";
import { motion } from "motion/react";
import { useState } from "react";

export type Marker = { label: string; count: number; coords: [number, number] };

/** Shared map renderer: draws country paths, places markers sized by count, and
 *  lets you hover/tap a marker (or legend chip) to highlight + reveal label. */
export default function GeoMap({
  features,
  projection,
  pathGen,
  markers,
  legend = [],
  alwaysLabelTop = 0,
  accent = "#35e0ff",
  width,
  height,
  ariaLabel,
}: {
  features: unknown[];
  projection: GeoProjection;
  pathGen: GeoPath;
  markers: Marker[];
  legend?: Marker[];
  alwaysLabelTop?: number;
  accent?: string;
  width: number;
  height: number;
  ariaLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(...markers.map((m) => m.count), 1);
  const radius = (c: number) => 4 + (c / max) * 14;
  const clear = (label: string) => setActive((a) => (a === label ? null : a));
  const toggle = (label: string) => setActive((a) => (a === label ? null : label));

  const alwaysSet = new Set(
    [...markers].sort((a, b) => b.count - a.count).slice(0, alwaysLabelTop).map((m) => m.label),
  );

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-5">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none" role="img" aria-label={ariaLabel}>
        <g>
          {features.map((f, i) => (
            <path
              key={i}
              d={pathGen(f as GeoPermissibleObjects) ?? undefined}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={0.4}
            />
          ))}
        </g>

        {markers.map((m) => {
          const xy = projection(m.coords);
          if (!xy) return null;
          const [x, y] = xy;
          const isActive = active === m.label;
          const dim = active !== null && !isActive;
          const flip = x > width * 0.68;
          const rr = radius(m.count);
          const text = `${m.label} · ${m.count}`;
          const boxW = text.length * 7 + 20;
          const showStatic = alwaysSet.has(m.label) && !isActive && !dim;
          return (
            <g
              key={m.label}
              onMouseEnter={() => setActive(m.label)}
              onMouseLeave={() => clear(m.label)}
              onClick={() => toggle(m.label)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r={rr + 11} fill="transparent" />
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
              {showStatic && (
                <text
                  x={x}
                  y={y - rr - 4}
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontSize={11}
                  fillOpacity={0.85}
                  className="display"
                  pointerEvents="none"
                >
                  {m.label}
                </text>
              )}
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
                    {text}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {legend.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {legend.map((m) => {
            const isActive = active === m.label;
            return (
              <button
                key={m.label}
                onMouseEnter={() => setActive(m.label)}
                onMouseLeave={() => clear(m.label)}
                onClick={() => toggle(m.label)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  isActive ? "border-transparent text-black" : "border-white/15 bg-white/5 hover:bg-white/10"
                }`}
                style={isActive ? { background: accent } : undefined}
              >
                <span>{m.label}</span>
                <span className="display tabular-nums opacity-80">{m.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
