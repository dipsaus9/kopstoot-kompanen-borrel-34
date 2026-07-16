"use client";

import { motion } from "motion/react";

type Bin = { label: string; count: number };

/** Vertical bar histogram with count labels — used for lengte & leeftijd. */
export default function Histogram({
  bins,
  accent = "#fff",
  unit = "",
  highlightMax = true,
}: {
  bins: Bin[];
  accent?: string;
  unit?: string;
  highlightMax?: boolean;
}) {
  const max = Math.max(...bins.map((b) => b.count), 1);
  return (
    <div className="flex w-full items-end justify-center gap-1.5 sm:gap-2.5" style={{ height: 200 }}>
      {bins.map((b, i) => {
        const isPeak = highlightMax && b.count === max;
        return (
          <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="display text-xs tabular-nums opacity-80 sm:text-sm">{b.count}</span>
            <motion.div
              className="w-full rounded-t-md"
              style={{
                background: accent,
                opacity: isPeak ? 1 : 0.55,
                maxWidth: 46,
              }}
              initial={{ height: 0 }}
              whileInView={{ height: `${(b.count / max) * 100}%` }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="text-[10px] tabular-nums opacity-60 sm:text-xs">{b.label}</span>
          </div>
        );
      })}
      {unit && <span className="ml-1 self-end pb-6 text-xs opacity-50">{unit}</span>}
    </div>
  );
}
