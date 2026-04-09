import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatMapLayer({ tasks }) {
  const map = useMap();

  useEffect(() => {
    // GUARD 1: Agar tasks array khali hai, toh kuch mat karo
    if (!tasks || tasks.length === 0) return;

    const points = tasks
      .filter((t) => t.location?.coordinates)
      .map((t) => [
        t.location.coordinates[1], // Latitude
        t.location.coordinates[0], // Longitude
        0.5, // Intensity
      ]);

    // GUARD 2: Agar valid coordinates nahi mile, toh layer mat banao
    if (points.length === 0) return;

    let heat;

    // Function to safely add layer only when map is actually visible
    const safelyAddHeatLayer = () => {
      // Map ki current size check karo
      const size = map.getSize();
      
      // GUARD 3: Agar map abhi hidden hai (width 0 hai), toh 100ms wait karke wapas try karo
      if (size.x === 0 || size.y === 0) {
        setTimeout(safelyAddHeatLayer, 100);
        return;
      }

      // Agar map visible hai aur valid size hai, toh draw kardo
      heat = L.heatLayer(points, {
        radius: 25,
        blur: 20,
      }).addTo(map);
    };

    // Draw karne ka process start karo
    safelyAddHeatLayer();

    // Cleanup function jab component unmount ho ya tasks change hon
    return () => {
      if (heat && map.hasLayer(heat)) {
        map.removeLayer(heat);
      }
    };

  }, [tasks, map]);

  return null;
}