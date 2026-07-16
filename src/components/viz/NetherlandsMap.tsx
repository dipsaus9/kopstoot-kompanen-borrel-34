"use client";

import { geoMercator, geoPath } from "d3-geo";
import { useMemo } from "react";
import nlGeo from "@/data/netherlands.geo.json";
import GeoMap, { type Marker } from "./GeoMap";

const W = 620;
const H = 620;

/** Interactive map of the Netherlands with the kompanen's home cities. */
export default function NetherlandsMap({
  cities,
  accent = "#35e0ff",
}: {
  cities: Marker[];
  accent?: string;
}) {
  const { features, projection, pathGen } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nl = nlGeo as any;
    const projection = geoMercator().fitExtent(
      [
        [24, 24],
        [W - 24, H - 24],
      ],
      nl,
    );
    return { features: [nl], projection, pathGen: geoPath(projection) };
  }, []);

  return (
    <GeoMap
      features={features}
      projection={projection}
      pathGen={pathGen}
      markers={cities}
      legend={[...cities].sort((a, b) => b.count - a.count).slice(0, 8)}
      alwaysLabelTop={6}
      accent={accent}
      width={W}
      height={H}
      ariaLabel="Kaart van Nederland met woonplaatsen van de kompanen"
    />
  );
}
