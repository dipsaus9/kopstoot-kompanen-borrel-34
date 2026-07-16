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
npm run data       # data opnieuw genereren
```

Om nieuwe/gewijzigde antwoorden te verwerken: vervang `data/survey.csv` en run `npm run data`.

## Slides

Intro → Lengte → Leeftijd → Herkomst → Borrel-ervaring → Komst → Signature gerecht →
IKEA-nacht → Memes → Onmisbaar → Consent = FRIES → Plassen & afval → Handhaving →
Motto's → Vakanties → Tips → Outro.

## Deploy

Push naar de repo en koppel aan **Vercel** (auto-detecteert Next.js, geen config nodig).
