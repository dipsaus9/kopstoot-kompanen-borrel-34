"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Quote = { name: string; text: string };
type Question = {
  text: string;
  options: string[];
  correct: Set<string>;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function buildQuestion(quotes: Quote[], names: string[], avoidText?: string): Question {
  const pool = avoidText && quotes.length > 1 ? quotes.filter((q) => q.text !== avoidText) : quotes;
  const meme = pool[Math.floor(Math.random() * pool.length)];
  // everyone who wrote this exact meme counts as correct
  const correct = new Set(
    quotes.filter((q) => q.text.toLowerCase() === meme.text.toLowerCase()).map((q) => q.name),
  );
  const distractors = shuffle(names.filter((n) => !correct.has(n))).slice(0, 3);
  const options = shuffle([meme.name, ...distractors]);
  return { text: meme.text, options, correct };
}

export default function MemeQuiz({
  quotes,
  accent = "#ff3d81",
}: {
  quotes: Quote[];
  accent?: string;
}) {
  const names = [...new Set(quotes.map((q) => q.name))];
  const [q, setQ] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ good: 0, total: 0 });

  // init on client only (Math.random would break SSR hydration)
  useEffect(() => {
    setQ(buildQuestion(quotes, names));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = () => {
    setPicked(null);
    setQ((prev) => buildQuestion(quotes, names, prev?.text));
  };

  const choose = (name: string) => {
    if (picked || !q) return;
    setPicked(name);
    setScore((s) => ({ good: s.good + (q.correct.has(name) ? 1 : 0), total: s.total + 1 }));
  };

  if (!q) {
    return <div className="h-[320px] w-full max-w-2xl animate-pulse rounded-2xl bg-white/5" />;
  }

  const answered = picked !== null;
  const gotIt = answered && q.correct.has(picked!);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      {/* the meme */}
      <div className="flex min-h-[140px] w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <AnimatePresence mode="wait">
          <motion.p
            key={q.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="display text-center text-2xl leading-tight sm:text-4xl"
          >
            “{q.text}”
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-sm uppercase tracking-[0.25em] opacity-70">Van wie is deze meme?</p>

      {/* options */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((name) => {
          const isCorrect = q.correct.has(name);
          const isPicked = picked === name;
          let style = "border-white/15 bg-white/5 hover:bg-white/10";
          if (answered && isCorrect) style = "border-transparent text-black";
          else if (answered && isPicked && !isCorrect) style = "border-transparent text-black";
          else if (answered) style = "border-white/10 bg-white/5 opacity-50";
          return (
            <button
              key={name}
              onClick={() => choose(name)}
              disabled={answered}
              className={`display rounded-2xl border px-5 py-4 text-lg transition ${style}`}
              style={
                answered && isCorrect
                  ? { background: "#3ddc84" }
                  : answered && isPicked && !isCorrect
                    ? { background: "#ff5470" }
                    : undefined
              }
            >
              {name}
              {answered && isCorrect && " ✓"}
              {answered && isPicked && !isCorrect && " ✗"}
            </button>
          );
        })}
      </div>

      {/* feedback + next */}
      <div className="flex min-h-[64px] flex-col items-center gap-3">
        <AnimatePresence>
          {answered && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="display text-xl"
              style={{ color: gotIt ? "#3ddc84" : "#ff5470" }}
            >
              {gotIt ? "Goed geraden! 🎉" : `Nope — dit was van ${[...q.correct].join(" / ")}`}
            </motion.p>
          )}
        </AnimatePresence>
        {answered && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={next}
            className="rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black transition hover:brightness-110"
            style={{ background: accent }}
          >
            Nieuwe meme →
          </motion.button>
        )}
      </div>

      <p className="text-sm tabular-nums opacity-60">
        Score: {score.good} / {score.total}
      </p>
    </div>
  );
}
