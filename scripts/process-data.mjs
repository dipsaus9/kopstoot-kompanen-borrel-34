// Build-time data pipeline: parse the survey CSV → src/data/wrapped.json
// Indexed by column POSITION (header names contain newlines/emoji and are fragile).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CSV = path.join(ROOT, "data", "survey.csv");
const OUT = path.join(ROOT, "src", "data", "wrapped.json");

// ---- column indices --------------------------------------------------------
const C = {
  TS: 0, NAME: 1, AGE: 2, HEIGHT: 3, ORIGIN: 4, COUNT: 5, ATTEND: 6,
  EXCITED: 7, MISS: 8, HACK: 9, MEME: 10, DISH: 11, IKEA: 12, ESSENTIAL: 13,
  MOTTO: 14, VACATION: 15, PROMISE: 16, CONSENT_CLEAR: 17, HANDHAVING: 18,
  WASTE: 19, PEE: 20, FRIES: 21, TIPS: 22,
};

// The raw CSV holds personal data and is intentionally kept OUT of the repo
// (see .gitignore). On CI/Vercel it is absent — build from the committed
// src/data/wrapped.json instead of failing.
if (!fs.existsSync(CSV)) {
  if (fs.existsSync(OUT)) {
    console.log(`ℹ survey.csv niet gevonden — bestaande ${path.relative(ROOT, OUT)} wordt gebruikt.`);
    process.exit(0);
  }
  console.error(`✗ survey.csv én ${path.relative(ROOT, OUT)} ontbreken. Kan geen data genereren.`);
  process.exit(1);
}

const raw = fs.readFileSync(CSV, "utf8");
const parsed = Papa.parse(raw, { skipEmptyLines: true });
const rows = parsed.data.slice(1); // drop header row
const clean = (s) => (s ?? "").toString().trim();
const records = rows
  .map((r) => r.map(clean))
  .filter((r) => r[C.NAME] && r[C.NAME] !== "");

// ---- helpers ---------------------------------------------------------------
const firstName = (s) => clean(s).split(/[\/(]/)[0].trim();

// Dutch ordinal words -> number (borrel count). Jokes -> null.
const ORDINALS = {
  eerste: 1, tweede: 2, derde: 3, vierde: 4, vijfde: 5, zesde: 6, zevende: 7,
  achtste: 8, negende: 9, tiende: 10, elfde: 11, twaalfde: 12, dertiende: 13,
  veertiende: 14, vijftiende: 15, zestiende: 16, zeventiende: 17,
  achttiende: 18, negentiende: 19, twintigste: 20,
  "drie-en-twintigste": 23, "vijf-en-twintigste": 25, "zes-en-twintigste": 26,
  "negen-en-twintig": 29,
};
function parseCount(s) {
  const t = clean(s).toLowerCase();
  for (const [word, n] of Object.entries(ORDINALS)) {
    if (t.startsWith(word)) return { n, joke: false };
  }
  // ordinals embedded mid-string
  for (const [word, n] of Object.entries(ORDINALS)) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return { n, joke: false };
  }
  return { n: null, joke: true }; // "VIER-EN-DERTIG DUIZEND BOMMEN...", kruidenrek, etc.
}

// city -> [lng, lat] for the ones that appear (approximate centroids)
const CITY_COORDS = {
  Amerongen: [5.45, 52.00], Hilversum: [5.18, 52.23], Rotterdam: [4.48, 51.92],
  Utrecht: [5.12, 52.09], Nijmegen: [5.86, 51.84], Hoorn: [5.06, 52.64],
  Haarlem: [4.63, 52.38], Amsterdam: [4.90, 52.37], Odijk: [5.22, 52.05],
  "Velsen-Noord": [4.66, 52.47], Holthone: [6.63, 52.63], Hillegom: [4.58, 52.29],
  Harlingen: [5.42, 53.17], Grootebroek: [5.20, 52.69], Volendam: [5.07, 52.49],
  Leidschendam: [4.40, 52.09], Oudenbosch: [4.53, 51.59], Huizen: [5.24, 52.30],
  Gennep: [5.97, 51.70], Almere: [5.22, 52.35], Ede: [5.66, 52.04],
  Zeist: [5.23, 52.09], Houten: [5.17, 52.03], Leiden: [4.50, 52.16],
  Zwolle: [6.09, 52.51], Emmen: [6.90, 52.79], Eindhoven: [5.48, 51.44],
  Oss: [5.53, 51.77], Langbroek: [5.31, 52.01], Schaijk: [5.63, 51.74],
  Delft: [4.36, 52.01], Oudheusden: [5.10, 51.72], "Den Haag": [4.30, 52.07],
  Vorden: [6.31, 52.10], Vlijmen: [5.22, 51.71], Obdam: [4.90, 52.68],
  Sliedrecht: [4.77, 51.82], Heerhugowaard: [4.83, 52.67], Boxtel: [5.32, 51.59],
  Amersfoort: [5.39, 52.16], "Sprang-Capelle": [5.00, 51.68], Hoofddorp: [4.69, 52.30],
  Drunen: [5.13, 51.69], Alblasserdam: [4.66, 51.86], Hulsel: [5.19, 51.44],
  Voorhout: [4.48, 52.22], Goorn: [5.00, 52.62], Montfoort: [4.95, 52.05],
  Oostkapelle: [3.55, 51.57], Alkmaar: [4.75, 52.63], Vlissingen: [3.57, 51.44],
  Curacao: [-68.99, 12.17], Amerongen2: [5.45, 52.0],
};
// fuzzy spellings / jokes -> canonical city key
const CITY_ALIASES = {
  "velsen noord": "Velsen-Noord", "den haag": "Den Haag", "de goorn": "Goorn",
  nimmaaaa: "Nijmegen", nijmegeeeee: "Nijmegen", nimwegen: "Nijmegen",
  nimma: "Nijmegen", haaaarlem: "Haarlem", eindhovennn: "Eindhoven",
  hillywood: "Hillegom", hoorny: "Hoorn", hooorn: "Hoorn", vlijmennn: "Vlijmen",
  "sprang capelle": "Sprang-Capelle", sprang: "Sprang-Capelle", uuuu: "Utrecht",
  utreg: "Utrecht", oss: "Oss",
};
// scan free-text origin for any known city (alias first, then coord keys)
function extractCity(s) {
  const t = clean(s).toLowerCase();
  if (!t) return null;
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (t.includes(alias)) return city;
  }
  // longest known city names first so "Velsen-Noord" beats "Velsen"
  const keys = Object.keys(CITY_COORDS).sort((a, b) => b.length - a.length);
  for (const city of keys) {
    if (t.includes(city.toLowerCase())) return city;
  }
  // fallback: first alphabetic token, title-cased
  const head = (t.match(/[a-zà-ÿ]+/) || [null])[0];
  return head ? head.charAt(0).toUpperCase() + head.slice(1) : null;
}

// ---- HEIGHT ----------------------------------------------------------------
const heights = records
  .map((r) => ({ name: firstName(r[C.NAME]), h: parseInt(r[C.HEIGHT], 10) }))
  .filter((x) => Number.isFinite(x.h) && x.h > 0);
const hSorted = [...heights].sort((a, b) => b.h - a.h);
const adults = heights.filter((x) => x.h >= 150);
const heightStats = {
  count: heights.length,
  avg: Math.round(adults.reduce((s, x) => s + x.h, 0) / adults.length),
  avgAll: Math.round(heights.reduce((s, x) => s + x.h, 0) / heights.length),
  tallest: hSorted[0],
  shortest: hSorted[hSorted.length - 1],
  tallestAdults: hSorted.slice(0, 5),
  all: heights,
  // histogram in 5cm buckets over adult range
  histogram: (() => {
    const buckets = {};
    for (const x of adults) {
      const b = Math.floor(x.h / 5) * 5;
      buckets[b] = (buckets[b] || 0) + 1;
    }
    return Object.entries(buckets)
      .map(([k, v]) => ({ bucket: Number(k), label: `${k}–${Number(k) + 4}`, count: v }))
      .sort((a, b) => a.bucket - b.bucket);
  })(),
};

// ---- AGE -------------------------------------------------------------------
const ages = records
  .map((r) => ({ name: firstName(r[C.NAME]), a: parseInt(clean(r[C.AGE]), 10) }))
  .filter((x) => Number.isFinite(x.a));
const aSorted = [...ages].sort((a, b) => b.a - a.a);
const grownAges = ages.filter((x) => x.a >= 18);
const ageStats = {
  avg: Math.round(grownAges.reduce((s, x) => s + x.a, 0) / grownAges.length),
  oldest: aSorted[0],
  youngest: aSorted[aSorted.length - 1],
  all: ages,
  histogram: (() => {
    const buckets = {};
    for (const x of grownAges) {
      const b = Math.floor(x.a / 5) * 5;
      buckets[b] = (buckets[b] || 0) + 1;
    }
    return Object.entries(buckets)
      .map(([k, v]) => ({ bucket: Number(k), label: `${k}–${Number(k) + 4}`, count: v }))
      .sort((a, b) => a.bucket - b.bucket);
  })(),
};

// ---- ORIGIN (map) ----------------------------------------------------------
const cityCounts = {};
for (const r of records) {
  const c = extractCity(r[C.ORIGIN]);
  if (!c) continue;
  cityCounts[c] = (cityCounts[c] || 0) + 1;
}
const cities = Object.entries(cityCounts)
  .map(([city, count]) => ({ city, count, coords: CITY_COORDS[city] || null }))
  .sort((a, b) => b.count - a.count);
const originStats = {
  cities: cities.filter((c) => c.coords),
  unmapped: cities.filter((c) => !c.coords).map((c) => c.city),
  topCity: cities.filter((c) => c.coords)[0],
};

// ---- BORREL COUNT ----------------------------------------------------------
const counts = records.map((r) => ({
  name: firstName(r[C.NAME]),
  ...parseCount(r[C.COUNT]),
}));
const realCounts = counts.filter((c) => c.n != null);
const countStats = {
  newbies: realCounts.filter((c) => c.n === 1).length,
  veterans: realCounts.filter((c) => c.n >= 10).length,
  totalBorrelsAttended: realCounts.reduce((s, c) => s + c.n, 0),
  mostExperienced: [...realCounts].sort((a, b) => b.n - a.n).slice(0, 5),
  distribution: (() => {
    const bins = { "1 (debuut)": 0, "2–5": 0, "6–10": 0, "11–20": 0, "21+": 0 };
    for (const c of realCounts) {
      if (c.n === 1) bins["1 (debuut)"]++;
      else if (c.n <= 5) bins["2–5"]++;
      else if (c.n <= 10) bins["6–10"]++;
      else if (c.n <= 20) bins["11–20"]++;
      else bins["21+"]++;
    }
    return Object.entries(bins).map(([label, count]) => ({ label, count }));
  })(),
};

// ---- ATTENDANCE ------------------------------------------------------------
function attendBucket(s) {
  const t = clean(s).toLowerCase();
  if (t.includes("kleedje")) return "Kleedje ligt klaar";
  if (t.includes("onderhandeling")) return "In onderhandeling";
  if (t.includes("verhinderd") || t.includes("slechte prioriteiten") || t.includes("kom niet"))
    return "Verhinderd";
  if (t.includes("durf nog niet") || t.includes("kruidenrek")) return "Twijfelgeval";
  return "Anders";
}
const attendCounts = {};
for (const r of records) {
  const b = attendBucket(r[C.ATTEND]);
  attendCounts[b] = (attendCounts[b] || 0) + 1;
}
const attendStats = {
  buckets: Object.entries(attendCounts).map(([label, count]) => ({ label, count })),
  yes: (attendCounts["Kleedje ligt klaar"] || 0),
  total: records.length,
};

// ---- WORD FREQUENCY (dishes + essentials) ---------------------------------
const STOP = new Set(("de het een en of van met in op te je ik we is met voor " +
  "aan als dat die dit er maar niet nog om ook wel wat naar bij uit " +
  "mijn zijn hun ze wij ff heb met een goed goede altijd echt heel veel " +
  "of een met en zo dan al m mn n t s ofzo of iets").split(/\s+/));
function wordFreq(col, { min = 3, top = 45 } = {}) {
  const freq = {};
  for (const r of records) {
    const text = clean(r[col]).toLowerCase().replace(/[^a-zà-ÿ\s]/g, " ");
    for (const w of text.split(/\s+/)) {
      if (w.length < min || STOP.has(w)) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, top);
}
const dishWords = wordFreq(C.DISH, { min: 4, top: 40 });
const essentialWords = wordFreq(C.ESSENTIAL, { min: 3, top: 40 });

// curated dish keyword tally (for a headline stat)
const dishKeywords = ["risotto", "pasta", "curry", "lasagne", "carbonara", "orzo", "salade", "balletjes", "rendang"];
const dishTally = dishKeywords
  .map((k) => ({
    dish: k,
    count: records.filter((r) => clean(r[C.DISH]).toLowerCase().includes(k)).length,
  }))
  .filter((d) => d.count > 0)
  .sort((a, b) => b.count - a.count);

// ---- CONSENT / FRIES -------------------------------------------------------
const FRIES_PARTS = [
  { key: "Freely given", label: "Freely given", match: "freely" },
  { key: "Reversible", label: "Reversible", match: "reversible" },
  { key: "Informed", label: "Informed", match: "informed" },
  { key: "Enthusiastic", label: "Enthusiastic", match: "enthusiastic" },
  { key: "Specific", label: "Specific", match: "specific" },
  { key: "FRIES!!!!!", label: "FRIES (patat!)", match: "fries" },
];
const friesStats = {
  parts: FRIES_PARTS.map((p) => ({
    label: p.label,
    count: records.filter((r) => clean(r[C.FRIES]).toLowerCase().includes(p.match)).length,
  })),
  fullFries: records.filter((r) => {
    const t = clean(r[C.FRIES]).toLowerCase();
    return FRIES_PARTS.every((p) => t.includes(p.match));
  }).length,
  total: records.length,
};

// ---- MULTI-SELECT tallies (handhaving / waste / pee) ----------------------
function optionTally(col, options) {
  return options
    .map((o) => ({
      label: o.label,
      count: records.filter((r) => clean(r[col]).toLowerCase().includes(o.match)).length,
    }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);
}
const handhavingStats = optionTally(C.HANDHAVING, [
  { label: "Rustig → verwijs naar borrelorgi", match: "borrelorgi" },
  { label: "Vraag of ze op de groepsfoto willen", match: "groepsfoto" },
  { label: "Recruiten als ze lang genoeg zijn", match: "recruiten" },
  { label: "Geitenkeutels gooien", match: "geitenkeutels" },
]);
const wasteStats = optionTally(C.WASTE, [
  { label: "In de vuilniszakken (braaf)", match: "vuilniszakken" },
  { label: "In mijn broekzak als souvenir", match: "broekzak" },
  { label: "Cadeautje voor Monica", match: "cadeautje" },
  { label: "Voeren aan de geiten", match: "geiten" },
]);
const peeStats = optionTally(C.PEE, [
  { label: "Openbare toiletten (braaf)", match: "openbare toiletten" },
  { label: "In de bosjes", match: "bosjes" },
  { label: "Luier om #lifehack", match: "luier" },
  { label: "Sponsor gemeente €170", match: "sponsor" },
  { label: "Tegen een andere kompaan", match: "andere kompaan" },
  { label: "Voeren aan de geiten (fout!)", match: "geiten" },
]);

// ---- QUOTE COLLECTIONS (carousels / walls) --------------------------------
function quotes(col, { min = 3, max = 240 } = {}) {
  return records
    .map((r) => ({ name: firstName(r[C.NAME]), text: clean(r[col]).replace(/\s+/g, " ") }))
    .filter(
      (q) =>
        q.text &&
        q.text.length >= min &&
        q.text.length <= max &&
        !["-", ".", "x", "nvt", "?", "idk", "geen", "geen idee"].includes(q.text.toLowerCase()),
    );
}
const ikeaQuotes = quotes(C.IKEA, { min: 8 });
const memeQuotes = quotes(C.MEME, { min: 4 });
const mottoQuotes = quotes(C.MOTTO, { min: 4 });
const hackQuotes = quotes(C.HACK, { min: 8 });
const tipsQuotes = quotes(C.TIPS, { min: 8 });

// ---- VACATIONS -------------------------------------------------------------
const DEST = [
  { label: "Italië", match: /itali[eë]|rome|napels|amalfi|sicili/i, coords: [12.5, 42.5] },
  { label: "Spanje", match: /spanje|sevilla|malaga|m[aá]laga|nerja|estartit|porto?bello|barcelona/i, coords: [-3.7, 40.4] },
  { label: "Frankrijk", match: /frankrijk|france/i, coords: [2.3, 46.6] },
  { label: "Duitsland", match: /duitsland|berlijn|berlin|moezel|cochem/i, coords: [10.4, 51.1] },
  { label: "Zwitserland", match: /zwitserland|switzerland/i, coords: [8.2, 46.8] },
  { label: "Oostenrijk", match: /oostenrijk|austria/i, coords: [14.5, 47.5] },
  { label: "Portugal", match: /portugal|algarve|porto\b|madeira/i, coords: [-8.2, 39.4] },
  { label: "Schotland / UK", match: /schotland|uk\b|engeland|londen|london|manchester|scotland/i, coords: [-3.2, 55.9] },
  { label: "Griekenland", match: /griekenland|greece|sziget?/i, coords: [21.8, 39.1] },
  { label: "Scandinavië", match: /zweden|sweden|finland|estland|denemarken|denmark/i, coords: [15.0, 60.0] },
  { label: "Azië", match: /japan|vietnam|thailand|india|nepal/i, coords: [100.0, 20.0] },
  { label: "Albanië", match: /albani[eë]/i, coords: [20.0, 41.0] },
  { label: "Curaçao", match: /curacao|curaçao/i, coords: [-68.99, 12.17] },
  { label: "Verre reis (Afrika/VS)", match: /afrika|amerika|\bvs\b|egypte/i, coords: [20.0, 5.0] },
  { label: "Lekker thuis (kikkerland)", match: /kikkerland|zeeland|veluwe|ameland|centerparcs|beuningen|nederland|utreg|geen vakantie|net een huis/i, coords: [5.3, 52.1] },
];
const vacationStats = {
  destinations: DEST.map((d) => ({
    label: d.label,
    coords: d.coords,
    count: records.filter((r) => d.match.test(clean(r[C.VACATION]))).length,
  }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count),
};

// ---- EXCITED / MISS (social graph flavor) ---------------------------------
const excitedQuotes = quotes(C.EXCITED, { min: 3 });
const missQuotes = quotes(C.MISS, { min: 3 });

// ---- ASSEMBLE --------------------------------------------------------------
const out = {
  meta: {
    edition: 34,
    title: "Borrel 34 Wrapped",
    date: "vrijdag 17 juli 2026",
    time: "15:00",
    respondents: records.length,
    generatedNote: "Gemaakt door AI ✨",
  },
  height: heightStats,
  age: ageStats,
  origin: originStats,
  count: countStats,
  attend: attendStats,
  dish: { words: dishWords, tally: dishTally },
  essentials: { words: essentialWords },
  ikea: ikeaQuotes,
  memes: memeQuotes,
  mottos: mottoQuotes,
  hacks: hackQuotes,
  tips: tipsQuotes,
  fries: friesStats,
  handhaving: handhavingStats,
  waste: wasteStats,
  pee: peeStats,
  vacation: vacationStats,
  excited: excitedQuotes,
  miss: missQuotes,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

// ---- console summary (for verification) -----------------------------------
console.log(`✓ ${records.length} respondenten verwerkt → ${path.relative(ROOT, OUT)}`);
console.log(`  lengte: avg(volw) ${heightStats.avg}cm, langste ${heightStats.tallest.name} ${heightStats.tallest.h}, kortste ${heightStats.shortest.name} ${heightStats.shortest.h}`);
console.log(`  leeftijd: avg ${ageStats.avg}, oudste ${ageStats.oldest.name} ${ageStats.oldest.a}, jongste ${ageStats.youngest.name} ${ageStats.youngest.a}`);
console.log(`  steden op kaart: ${originStats.cities.length}, top ${originStats.topCity?.city} (${originStats.topCity?.count})`);
console.log(`  ongemapte steden: ${originStats.unmapped.join(", ") || "geen"}`);
console.log(`  borrels: ${countStats.newbies} debuten, ${countStats.veterans} veteranen, totaal ${countStats.totalBorrelsAttended} borrels`);
console.log(`  komst: ${JSON.stringify(attendStats.buckets)}`);
console.log(`  FRIES compleet: ${friesStats.fullFries}/${friesStats.total}`);
console.log(`  bestemmingen: ${vacationStats.destinations.map((d) => `${d.label}(${d.count})`).join(", ")}`);
