"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import { useMemo } from "react";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-110m.json";
import GeoMap, { type Marker } from "./GeoMap";

const W = 820;
const H = 440;

/** Interactive world map of holiday destinations. */
export default function WorldMap({
  destinations,
  accent = "#35e0ff",
}: {
  destinations: Marker[];
  accent?: string;
}) {
  const { features, projection, pathGen } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fc = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
    const projection = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [W - 8, H - 8],
      ],
      fc,
    );
    return { features: fc.features as unknown[], projection, pathGen: geoPath(projection) };
  }, []);

  return (
    <GeoMap
      features={features}
      projection={projection}
      pathGen={pathGen}
      markers={destinations}
      legend={destinations}
      accent={accent}
      width={W}
      height={H}
      ariaLabel="Wereldkaart met vakantiebestemmingen"
    />
  );
}
