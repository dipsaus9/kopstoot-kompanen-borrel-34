"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Tip = { name: string; text: string };
type Category = { emoji: string; label: string; color: string };

const CATS: Record<string, Category> = {
  love: { emoji: "💛", label: "Liefdesbriefje", color: "#ffd23d" },
  weetje: { emoji: "🧠", label: "Willekeurig weetje", color: "#35e0ff" },
  hype: { emoji: "🔥", label: "Pure hype", color: "#ff8a3d" },
  wartaal: { emoji: "🤪", label: "Wartaal", color: "#7b5cff" },
  vraag: { emoji: "❓", label: "Prangende vraag", color: "#ff3d81" },
  zomaar: { emoji: "✨", label: "Zomaar iets", color: "#c6ff3d" },
};

function categorize(text: string): Category {
  const t = text.toLowerCase().trim();
  if (/love|<3|❤|🩷|🫶|dankjewel|jullie zijn top|top!/.test(t)) return CATS.love;
  if (/wist je|species|penis|areola|tepel|wasbeer|bijen|echidna|zwijn|sonic|spoon/.test(t))
    return CATS.weetje;
  if (/zin in|zin â|zin innn|let'?s go|mo+f+el|benieuwd/.test(t)) return CATS.hype;
  if (/pfiep|plopper|sli sla|paparpapa|slay/.test(t)) return CATS.wartaal;
  if (t.endsWith("?")) return CATS.vraag;
  return CATS.zomaar;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function TipsDeck({ tips, accent = "#c6ff3d" }: { tips: Tip[]; accent?: string }) {
  const [deck, setDeck] = useState<Tip[] | null>(null);
  const [i, setI] = useState(0);

  // shuffle client-side only (avoid SSR hydration mismatch)
  useEffect(() => {
    setDeck(shuffle(tips));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!deck) {
    return <div className="h-[300px] w-full max-w-xl animate-pulse rounded-3xl bg-white/5" />;
  }

  const tip = deck[i];
  const cat = categorize(tip.text);
  const draw = () =>
    setI((prev) => {
      const next = prev + 1;
      if (next >= deck.length) {
        setDeck(shuffle(tips));
        return 0;
      }
      return next;
    });

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="relative w-full" style={{ perspective: 1200 }}>
        {/* stacked cards behind for a "deck" feel */}
        <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-3xl border border-white/10 bg-white/[0.03]" />
        <div className="absolute inset-0 -translate-x-2 translate-y-1.5 -rotate-2 rounded-3xl border border-white/10 bg-white/[0.04]" />

        <AnimatePresence mode="wait">
          <motion.article
            key={i}
            initial={{ opacity: 0, rotateY: -22, y: 24 }}
            animate={{ opacity: 1, rotateY: 0, y: 0 }}
            exit={{ opacity: 0, rotateY: 18, y: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-[260px] flex-col justify-between rounded-3xl border border-white/15 bg-white/[0.07] p-7 text-left backdrop-blur-md"
            style={{ boxShadow: `0 20px 60px -20px ${cat.color}55` }}
          >
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest text-black"
              style={{ background: cat.color }}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </span>

            <p className="display my-5 text-2xl leading-tight sm:text-3xl">“{tip.text}”</p>

            <footer className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em]" style={{ color: cat.color }}>
                — {tip.name}
              </span>
              <span className="text-xs tabular-nums opacity-50">
                {String(i + 1).padStart(2, "0")} / {deck.length}
              </span>
            </footer>
          </motion.article>
        </AnimatePresence>
      </div>

      <button
        onClick={draw}
        className="rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-widest text-black transition hover:brightness-110"
        style={{ background: accent }}
      >
        Volgende kaart →
      </button>
    </div>
  );
}
