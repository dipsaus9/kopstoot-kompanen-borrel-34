"use client";

import { motion } from "motion/react";

type Seg = { label: string; count: number; color: string };

export default function Donut({
  segments,
  centerLabel,
  centerSub,
}: {
  segments: Seg[];
  centerLabel: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  const R = 80;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
      <div className="relative shrink-0">
        <svg width={200} height={200} viewBox="0 0 200 200" className="-rotate-90">
          {segments.map((seg) => {
            const frac = seg.count / total;
            const dash = frac * C;
            const el = (
              <motion.circle
                key={seg.label}
                cx={100}
                cy={100}
                r={R}
                fill="none"
                stroke={seg.color}
                strokeWidth={26}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6 }}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex rotate-0 flex-col items-center justify-center">
          <span className="display text-4xl">{centerLabel}</span>
          {centerSub && <span className="text-xs opacity-70">{centerSub}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-2 text-left">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: seg.color }} />
            <span className="text-sm sm:text-base">{seg.label}</span>
            <span className="display text-sm tabular-nums opacity-70">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
