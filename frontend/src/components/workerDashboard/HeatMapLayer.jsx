import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatMapLayer({ tasks }) {

  const map = useMap();

  useEffect(() => {

    const points = tasks
      .filter((t) => t.location?.coordinates)
      .map((t) => [
        t.location.coordinates[1],
        t.location.coordinates[0],
        0.5,
      ]);

    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 20,
    }).addTo(map);

    return () => map.removeLayer(heat);

  }, [tasks]);

  return null;
}