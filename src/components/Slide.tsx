"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type SlideProps = {
  children: ReactNode;
  /** CSS background (gradient) for the slide */
  bg: string;
  /** small kicker label top-left */
  kicker?: string;
  index?: number;
  className?: string;
};

export default function Slide({ children, bg, kicker, index, className }: SlideProps) {
  return (
    <section className="slide grain" style={{ background: bg }}>
      {kicker && (
        <div className="absolute left-0 top-0 flex w-full items-center justify-between px-6 py-5 text-xs uppercase tracking-[0.25em] opacity-70 sm:px-10">
          <span className="display">{kicker}</span>
          {index != null && <span className="tabular-nums">{String(index).padStart(2, "0")}</span>}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.4, once: false }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`relative z-10 flex w-full max-w-4xl flex-col items-center text-center ${className ?? ""}`}
      >
        {children}
      </motion.div>
    </section>
  );
}
