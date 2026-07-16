"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Quote = { name: string; text: string };

export default function QuoteCarousel({
  quotes,
  interval = 4200,
  accent = "#fff",
}: {
  quotes: Quote[];
  interval?: number;
  accent?: string;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || quotes.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % quotes.length), interval);
    return () => clearInterval(t);
  }, [paused, quotes.length, interval]);

  const q = quotes[i];
  const sizeClass =
    q.text.length > 150
      ? "text-lg sm:text-2xl"
      : q.text.length > 80
        ? "text-xl sm:text-3xl"
        : "text-2xl sm:text-4xl";

  return (
    <div
      className="flex min-h-[220px] w-full max-w-3xl flex-col items-center justify-center"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <span className={`display leading-tight ${sizeClass}`}>“{q.text}”</span>
          <span className="text-sm uppercase tracking-[0.2em]" style={{ color: accent }}>
            — {q.name}
          </span>
        </motion.blockquote>
      </AnimatePresence>
      <div className="mt-8 flex gap-1.5">
        {quotes.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Ga naar quote ${idx + 1}`}
            onClick={() => setI(idx)}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: idx === i ? 22 : 6,
              background: idx === i ? accent : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
