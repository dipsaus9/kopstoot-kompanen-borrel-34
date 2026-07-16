"use client";

import { motion } from "motion/react";

type Word = { text: string; value: number };

/** Weighted tag-cloud: font-size scales with frequency, centred flow layout. */
export default function WordCloud({
  words,
  palette,
}: {
  words: Word[];
  palette: string[];
}) {
  const values = words.map((w) => w.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const size = (v: number) => {
    const t = max === min ? 1 : (v - min) / (max - min);
    return 0.85 + t * 2.9; // rem
  };
  return (
    <div className="flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
      {words.map((w, i) => (
        <motion.span
          key={w.text}
          className="display leading-none"
          style={{
            fontSize: `${size(w.value)}rem`,
            color: palette[i % palette.length],
            opacity: 0.55 + 0.45 * ((w.value - min) / (max - min || 1)),
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 0.55 + 0.45 * ((w.value - min) / (max - min || 1)), scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.8) }}
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
}
