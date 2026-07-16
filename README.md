# Borrel 34 Wrapped

Een Spotify-Wrapped-achtige scrollervaring die de pre-borrel enquête van de **34e Kopstoot Kompanen borrel** (vrijdag 17 juli 2026, parkborrel) visualiseert. Lange mensen, gekke antwoorden.

Gemaakt door Dipsaus ✨

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS 4**
- **Motion** (Framer Motion) voor animaties & scroll-reveals
- Custom SVG-visualisaties (histogrammen, donut, constellation-kaarten, word clouds)
- Data wordt bij build uit de CSV geparsed → `src/data/wrapped.json`

## Ontwikkelen

```bash
npm install
npm run dev        # draait eerst de data-pipeline, dan next dev
```

Open http://localhost:3000.

## Data

De ruwe enquête staat in `data/survey.csv`. De pipeline in `scripts/process-data.mjs`
leest die kolommen op positie (headers bevatten newlines/emoji) en produceert alle
afgeleide statistieken. Bij `dev` en `build` draait die automatisch (`predev`/`prebuild`).

```bash
npm run data       # wrapped.json opnieuw genereren uit de lokale CSV
npm run sync       # verse antwoorden uit de Google Sheet halen + wrapped.json bijwerken
```

**Antwoorden bijwerken (aanbevolen):**

```bash
npm run sync
git add src/data/wrapped.json && git commit -m "Data bijgewerkt" && git push
```

`npm run sync` haalt de laatste antwoorden uit de gekoppelde Google Sheet
(`scripts/sync-data.mjs`, sheet moet "iedereen met link mag bekijken" zijn),
schrijft ze naar het lokale `data/survey.csv` (blijft buiten de repo) en
regenereert `src/data/wrapped.json`. Commit die JSON → Vercel redeployt met de
nieuwe data. Een andere sheet? Zet `SHEET_CSV_URL=<csv-url> npm run sync`.

## Slides

Intro → Lengte → Leeftijd → Herkomst → Borrel-ervaring → Komst → Signature gerecht →
IKEA-nacht → Memes → Onmisbaar → Consent = FRIES → Plassen & afval → Handhaving →
Motto's → Vakanties → Tips → Outro.

## Deploy

Push naar de repo en koppel aan **Vercel** (auto-detecteert Next.js, geen config nodig).
