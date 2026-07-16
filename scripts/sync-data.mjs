// Fetch the latest answers from the Google Sheet and write them to
// data/survey.csv (kept local / out of the repo). Then `process-data.mjs`
// regenerates src/data/wrapped.json. Run: npm run sync
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV = path.resolve(__dirname, "..", "data", "survey.csv");

// The sheet must be shared as "anyone with the link can view".
const SHEET_ID = "12fu2HE5LTTSJ8IXzS9N0BW46Og0iamL2cNewm-1KLuo";
const URL =
  process.env.SHEET_CSV_URL ??
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const res = await fetch(URL, { redirect: "follow" });
if (!res.ok) {
  console.error(`✗ Kon de sheet niet ophalen (HTTP ${res.status}). Staat 'ie op 'iedereen met link mag bekijken'?`);
  process.exit(1);
}
const csv = await res.text();
if (csv.trimStart().startsWith("<!DOCTYPE") || csv.trimStart().startsWith("<html")) {
  console.error("✗ Kreeg HTML i.p.v. CSV terug — de sheet is waarschijnlijk niet publiek deelbaar.");
  process.exit(1);
}

const rows = csv.split(/\r?\n/).filter((l) => l.trim()).length;
fs.mkdirSync(path.dirname(CSV), { recursive: true });
fs.writeFileSync(CSV, csv);
console.log(`✓ Sheet opgehaald → data/survey.csv (${(csv.length / 1024).toFixed(1)} kB, ~${rows} regels)`);
