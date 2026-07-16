"use client";

import { motion } from "motion/react";

type Point = { label: string; count: number; coords: [number, number] };
type Bounds = { minLng: number; maxLng: number; minLat: number; maxLat: number };

/** Abstract constellation map: lng/lat projected into a viewBox, dots sized by count. */
export default function DotMap({
  points,
  bounds,
  width = 640,
  height = 440,
  origin,
  labelTop = 8,
  accent = "#fff",
}: {
  points: Point[];
  bounds: Bounds;
  width?: number;
  height?: number;
  origin?: [number, number];
  labelTop?: number;
  accent?: string;
}) {
  const pad = 40;
  const project = ([lng, lat]: [number, number]) => {
    const x = pad + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 2 * pad);
    const y = pad + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * pad);
    return [x, y] as const;
  };
  const max = Math.max(...points.map((p) => p.count), 1);
  const r = (c: number) => 5 + (c / max) * 20;
  const sorted = [...points].sort((a, b) => b.count - a.count);
  const originXY = origin ? project(origin) : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl" role="img">
      {/* flight lines to origin */}
      {originXY &&
        sorted.map((p, i) => {
          const [x, y] = project(p.coords);
          return (
            <motion.line
              key={`l-${p.label}`}
              x1={originXY[0]}
              y1={originXY[1]}
              x2={x}
              y2={y}
              stroke={accent}
              strokeWidth={0.6}
              strokeOpacity={0.18}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.03 * i }}
            />
          );
        })}
      {sorted.map((p, i) => {
        const [x, y] = project(p.coords);
        const showLabel = i < labelTop;
        return (
          <g key={p.label}>
            <motion.circle
              cx={x}
              cy={y}
              r={r(p.count)}
              fill={accent}
              fillOpacity={0.85}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.85 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.03 * i }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
            {showLabel && (
              <motion.text
                x={x}
                y={y - r(p.count) - 4}
                textAnchor="middle"
                className="display"
                fill="var(--ink)"
                fontSize={13}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.95 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.03 * i + 0.2 }}
              >
                {p.label}
                <tspan fontSize={11} fillOpacity={0.6}>
                  {"  "}
                  {p.count}
                </tspan>
              </motion.text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
