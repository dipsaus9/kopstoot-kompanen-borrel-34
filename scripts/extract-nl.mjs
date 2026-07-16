// One-off: extract the European Netherlands outline from world-atlas (10m) into
// a small local GeoJSON so we can bundle just NL instead of the 3.6MB world file.
// Run: node scripts/extract-nl.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "src", "data", "netherlands.geo.json");

const topo = require("world-atlas/countries-10m.json");
const fc = feature(topo, topo.objects.countries);
const nl = fc.features.find((f) => f.properties.name === "Netherlands");

// keep only European polygons (drop Caribbean parts at negative longitudes)
const european = nl.geometry.coordinates.filter((poly) => {
  const ring = poly[0];
  const maxLng = Math.max(...ring.map(([x]) => x));
  return maxLng < 10 && maxLng > 0;
});

const out = {
  type: "Feature",
  properties: { name: "Nederland" },
  geometry: { type: "MultiPolygon", coordinates: european },
};

fs.writeFileSync(OUT, JSON.stringify(out));
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`✓ ${european.length} Europese polygonen → src/data/netherlands.geo.json (${kb} kB)`);
