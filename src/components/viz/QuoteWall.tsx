"use client";

import { motion } from "motion/react";

type Quote = { name: string; text: string };

export default function QuoteWall({
  quotes,
  accent = "#fff",
}: {
  quotes: Quote[];
  accent?: string;
}) {
  return (
    <div
      className="w-full max-h-[62vh] overflow-y-auto columns-1 gap-3 px-1 sm:columns-2 lg:columns-3 [column-fill:_balance]"
      style={{ touchAction: "pan-y", scrollbarWidth: "thin" }}
    >
      {quotes.map((q, i) => (
        <motion.figure
          key={`${q.name}-${i}`}
          className="mb-3 break-inside-avoid rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: Math.min(i * 0.04, 0.6) }}
        >
          <blockquote className="text-sm leading-snug sm:text-base">“{q.text}”</blockquote>
          <figcaption className="mt-2 text-xs uppercase tracking-widest" style={{ color: accent }}>
            {q.name}
          </figcaption>
        </motion.figure>
      ))}
    </div>
  );
}
