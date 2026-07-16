"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import wrapped from "@/data/wrapped.json";
import Slide from "@/components/Slide";
import CountUp from "@/components/ui/CountUp";
import BarList from "@/components/viz/BarList";
import Histogram from "@/components/viz/Histogram";
import Donut from "@/components/viz/Donut";
import WordCloud from "@/components/viz/WordCloud";
import DotMap from "@/components/viz/DotMap";
import WorldMap from "@/components/viz/WorldMap";
import QuoteCarousel from "@/components/viz/QuoteCarousel";
import QuoteWall from "@/components/viz/QuoteWall";
import MemeQuiz from "@/components/viz/MemeQuiz";
import TipsDeck from "@/components/viz/TipsDeck";

const d = wrapped;
const tuple = (c: number[]) => [c[0], c[1]] as [number, number];

const NL_BOUNDS = { minLng: 3.3, maxLng: 7.1, minLat: 50.6, maxLat: 53.6 };

const CLOUD_PALETTE = ["#c6ff3d", "#ff3d81", "#35e0ff", "#ffd23d", "#7b5cff", "#ff8a3d"];

export default function Page() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Remember which slide you were on (localStorage) and restore it on reload.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const KEY = "borrel34-slide";
    const slides = Array.from(container.querySelectorAll<HTMLElement>(".slide"));
    if (!slides.length) return;

    let restoring = true;
    const saved = Number(localStorage.getItem(KEY));
    if (Number.isFinite(saved) && saved > 0 && saved < slides.length) {
      requestAnimationFrame(() => {
        slides[saved].scrollIntoView({ behavior: "auto" });
        // let the jump settle before we start recording again
        setTimeout(() => (restoring = false), 250);
      });
    } else {
      restoring = false;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (restoring) return;
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const i = slides.indexOf(e.target as HTMLElement);
            if (i >= 0) localStorage.setItem(KEY, String(i));
          }
        }
      },
      { root: container, threshold: [0.6] },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  let n = 0;
  const idx = () => ++n;

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-50 h-1 origin-left"
        style={{
          scaleX: progress,
          width: "100%",
          background: "linear-gradient(90deg,#c6ff3d,#ff3d81,#35e0ff)",
        }}
      />
      <main ref={scrollRef} className="snap-scroll">
        {/* ───────────── INTRO ───────────── */}
        <Slide bg="radial-gradient(120% 120% at 50% 0%, #2a0a4a 0%, #0a0510 60%)">
          <motion.p
            className="mb-4 text-sm uppercase tracking-[0.4em] opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.2 }}
          >
            Kopstoot Kompanen · Editie {d.meta.edition}
          </motion.p>
          <h1 className="display text-6xl sm:text-8xl">
            <span
              style={{
                background: "linear-gradient(90deg,#c6ff3d,#35e0ff,#ff3d81)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Borrel 34
            </span>
            <br />
            Wrapped
          </h1>
          <p className="mt-6 max-w-md text-base opacity-80 sm:text-lg">
            {d.meta.respondents} lange mensen. {d.meta.date} vanaf {d.meta.time} in het park.
            Dit vulden jullie in.
          </p>
          <motion.div
            className="mt-14 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-60"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            Scroll
            <span aria-hidden>↓</span>
          </motion.div>
        </Slide>

        {/* ───────────── LENGTE ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#132b12 100%)"
          kicker="De lat ligt hoog"
          index={idx()}
        >
          <p className="text-sm uppercase tracking-[0.3em] opacity-70">Gemiddelde lengte (volwassen)</p>
          <div className="display my-2 text-7xl sm:text-9xl" style={{ color: "#c6ff3d" }}>
            <CountUp to={d.height.avg} suffix=" cm" />
          </div>
          <p className="mb-8 max-w-md opacity-80">
            Het Nederlands gemiddelde is ~184 cm (man) / 170 cm (vrouw). Jullie torenen daar
            vrolijk bovenuit.
          </p>
          <Histogram bins={d.height.histogram} accent="#c6ff3d" />
          <div className="mt-8 flex gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Langste kompaan</p>
              <p className="display text-2xl">
                {d.height.tallest.name} · {d.height.tallest.h} cm
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Kleinste kompaan</p>
              <p className="display text-2xl">
                {d.height.shortest.name} · {d.height.shortest.h} cm
              </p>
            </div>
          </div>
        </Slide>

        {/* ───────────── LEEFTIJD ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#3a0f2e 100%)"
          kicker="Jong van geest"
          index={idx()}
        >
          <p className="text-sm uppercase tracking-[0.3em] opacity-70">Gemiddelde leeftijd</p>
          <div className="display my-2 text-7xl sm:text-9xl" style={{ color: "#ff3d81" }}>
            <CountUp to={d.age.avg} />
          </div>
          <Histogram bins={d.age.histogram} accent="#ff3d81" />
          <div className="mt-8 flex gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Wijste kompaan</p>
              <p className="display text-2xl">
                {d.age.oldest.name} · {d.age.oldest.a}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60">Jongste kompaan</p>
              <p className="display text-2xl">
                {d.age.youngest.name} · {d.age.youngest.a}
              </p>
            </div>
          </div>
        </Slide>

        {/* ───────────── HERKOMST ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#0d2440 100%)"
          kicker="Van heinde en verre"
          index={idx()}
        >
          <h2 className="display mb-2 text-4xl sm:text-6xl">Waar komen jullie vandaan?</h2>
          <p className="mb-6 opacity-80">
            {d.origin.topCity.city} is de thuisbasis met {d.origin.topCity.count} kompanen.
          </p>
          <DotMap
            points={d.origin.cities.map((c) => ({
              label: c.city,
              count: c.count,
              coords: tuple(c.coords),
            }))}
            bounds={NL_BOUNDS}
            origin={tuple(d.origin.topCity.coords)}
            accent="#35e0ff"
            labelTop={7}
          />
        </Slide>

        {/* ───────────── BORREL-ERVARING ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#2a1a0a 100%)"
          kicker="Doorgewinterd"
          index={idx()}
        >
          <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-2">
            <div>
              <div className="display text-6xl sm:text-8xl" style={{ color: "#ff8a3d" }}>
                <CountUp to={d.count.totalBorrelsAttended} />
              </div>
              <p className="text-xs uppercase tracking-widest opacity-60">borrels samen bezocht</p>
            </div>
            <div>
              <div className="display text-6xl sm:text-8xl" style={{ color: "#c6ff3d" }}>
                <CountUp to={d.count.newbies} />
              </div>
              <p className="text-xs uppercase tracking-widest opacity-60">debutanten</p>
            </div>
          </div>
          <div className="mt-10 w-full max-w-lg">
            <BarList items={d.count.distribution} accent="#ff8a3d" />
          </div>
          <p className="mt-6 text-sm opacity-70">
            Meest doorgewinterd:{" "}
            {d.count.mostExperienced
              .slice(0, 3)
              .map((m) => `${m.name} (${m.n}e)`)
              .join(" · ")}
          </p>
        </Slide>

        {/* ───────────── KOMST ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#241046 100%)"
          kicker="Kleedje ligt klaar"
          index={idx()}
        >
          <h2 className="display mb-8 text-4xl sm:text-6xl">Kom je vrijdag?</h2>
          <Donut
            segments={[
              { label: "Kleedje ligt al klaar", count: bucket("Kleedje ligt klaar"), color: "#c6ff3d" },
              { label: "In onderhandeling", count: bucket("In onderhandeling"), color: "#35e0ff" },
              { label: "Twijfelgeval", count: bucket("Twijfelgeval"), color: "#ffd23d" },
              { label: "Verhinderd", count: bucket("Verhinderd"), color: "#ff3d81" },
              { label: "Anders", count: bucket("Anders"), color: "#7b5cff" },
            ].filter((s) => s.count > 0)}
            centerLabel={`${Math.round((d.attend.yes / d.attend.total) * 100)}%`}
            centerSub="ligt klaar"
          />
        </Slide>

        {/* ───────────── SIGNATURE GERECHT ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#3a1206 100%)"
          kicker="Indruk maken"
          index={idx()}
        >
          <h2 className="display mb-2 text-4xl sm:text-6xl">Het go-to gerecht</h2>
          <p className="mb-8 opacity-80">
            {d.dish.tally[0].dish} wint met afstand — {d.dish.tally[0].count} keer genoemd.
          </p>
          <WordCloud words={d.dish.words} palette={CLOUD_PALETTE} />
        </Slide>

        {/* ───────────── IKEA ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#0a2036 60%,#1a3a0a 100%)"
          kicker="Opgesloten in de IKEA"
          index={idx()}
        >
          <h2 className="display mb-3 text-3xl sm:text-5xl">
            Een nacht alleen in de IKEA. Wat doe je?
          </h2>
          <p className="mb-6 text-sm opacity-70">
            (Spoiler: het gaat vooral over Zweedse balletjes en bedden testen)
          </p>
          <QuoteCarousel quotes={d.ikea} accent="#ffd23d" />
        </Slide>

        {/* ───────────── MEMES ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#2a0a3a 100%)"
          kicker="Rent-free"
          index={idx()}
        >
          <h2 className="display mb-6 text-3xl sm:text-5xl">
            De meme die rent-free in je hoofd woont
          </h2>
          <MemeQuiz quotes={d.memes} accent="#ff3d81" />
        </Slide>

        {/* ───────────── ONMISBAAR ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#123a2a 100%)"
          kicker="Onmisbaar"
          index={idx()}
        >
          <h2 className="display mb-8 text-4xl sm:text-6xl">
            Wat mag écht niet ontbreken op een parkborrel?
          </h2>
          <WordCloud words={d.essentials.words} palette={CLOUD_PALETTE} />
        </Slide>

        {/* ───────────── CONSENT = FRIES ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#3a2e06 100%)"
          kicker="Consent = FRIES"
          index={idx()}
        >
          <h2 className="display mb-2 text-4xl sm:text-6xl" style={{ color: "#ffd23d" }}>
            F · R · I · E · S
          </h2>
          <p className="mb-8 opacity-80">
            <CountUp to={d.fries.fullFries} /> van de {d.fries.total} kompanen kozen álle
            frietjes van de consent-friet.
          </p>
          <div className="w-full max-w-lg">
            <BarList items={d.fries.parts} accent="#ffd23d" />
          </div>
        </Slide>

        {/* ───────────── PLASSEN & AFVAL ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#0a2a2e 100%)"
          kicker="Etiquette"
          index={idx()}
        >
          <h2 className="display mb-8 text-4xl sm:text-6xl">De regeltjes (en de uitzonderingen)</h2>
          <div className="grid w-full max-w-3xl gap-8 sm:grid-cols-2">
            <div className="text-left">
              <p className="mb-3 text-sm uppercase tracking-widest opacity-70">💧 Plassen doen we…</p>
              <BarList items={d.pee} accent="#35e0ff" />
            </div>
            <div className="text-left">
              <p className="mb-3 text-sm uppercase tracking-widest opacity-70">🗑️ Afval gaat…</p>
              <BarList items={d.waste} accent="#c6ff3d" />
            </div>
          </div>
        </Slide>

        {/* ───────────── HANDHAVING ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#2a0a1a 100%)"
          kicker="Monica komt langs"
          index={idx()}
        >
          <h2 className="display mb-8 text-3xl sm:text-5xl">
            Handhaving, politie of bestie Monica komt langs…
          </h2>
          <div className="w-full max-w-lg">
            <BarList items={d.handhaving} accent="#ff3d81" />
          </div>
        </Slide>

        {/* ───────────── MOTTO'S ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#1a1046 100%)"
          kicker="Levensmotto's"
          index={idx()}
          className="!max-w-6xl"
        >
          <h2 className="display mb-8 text-4xl sm:text-6xl">Woorden om op te leven</h2>
          <QuoteWall quotes={d.mottos.slice(0, 18)} accent="#7b5cff" />
        </Slide>

        {/* ───────────── VAKANTIES ───────────── */}
        <Slide
          bg="linear-gradient(160deg,#0a0510 0%,#06283a 100%)"
          kicker="Nog even weg"
          index={idx()}
        >
          <h2 className="display mb-2 text-4xl sm:text-6xl">Waar gaat de reis naartoe?</h2>
          <p className="mb-6 opacity-80">
            {d.vacation.destinations[0].label} is favoriet ({d.vacation.destinations[0].count}×).
          </p>
          <WorldMap
            destinations={d.vacation.destinations.map((c) => ({
              label: c.label,
              count: c.count,
              coords: tuple(c.coords),
            }))}
            accent="#35e0ff"
          />
        </Slide>

        {/* ───────────── TIPS / OUTRO ───────────── */}
        <Slide
          bg="radial-gradient(120% 120% at 50% 100%, #2a0a4a 0%, #0a0510 65%)"
          kicker="Tot slot"
          index={idx()}
        >
          <h2 className="display mb-2 text-4xl sm:text-6xl">De kompanen-kaartenbak</h2>
          <p className="mb-8 opacity-80">Weetjes, prangende vragen en pure onzin. Trek maar 'n kaartje.</p>
          <TipsDeck tips={d.tips} accent="#c6ff3d" />
        </Slide>

        <Slide bg="radial-gradient(120% 120% at 50% 0%, #132b12 0%, #0a0510 60%)">
          <h2 className="display text-5xl sm:text-7xl">
            Tot vrijdag,
            <br />
            <span style={{ color: "#c6ff3d" }}>kompanen!</span>
          </h2>
          <p className="mt-6 opacity-80">
            {d.meta.date} · {d.meta.time} · het park
          </p>
          <p className="mt-10 text-xs uppercase tracking-[0.3em] opacity-50">
            {d.meta.generatedNote}
          </p>
        </Slide>
      </main>
    </>
  );
}

function bucket(label: string): number {
  return d.attend.buckets.find((b) => b.label === label)?.count ?? 0;
}
