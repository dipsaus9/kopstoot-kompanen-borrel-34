"use client";

import { motion } from "motion/react";

type Item = { label: string; count: number };

export default function BarList({
  items,
  accent = "#fff",
  trackOpacity = 0.14,
  suffix = "",
}: {
  items: Item[];
  accent?: string;
  trackOpacity?: number;
  suffix?: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="flex w-full flex-col gap-3">
      {items.map((item, i) => (
        <div key={item.label} className="w-full">
          <div className="mb-1 flex items-baseline justify-between gap-4 text-left">
            <span className="text-sm font-medium sm:text-base">{item.label}</span>
            <span className="display text-sm tabular-nums opacity-90 sm:text-base">
              {item.count}
              {suffix}
            </span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full"
            style={{ background: `rgba(255,255,255,${trackOpacity})` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: accent }}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.count / max) * 100}%` }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
