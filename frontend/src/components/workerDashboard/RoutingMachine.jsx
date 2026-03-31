import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

export default function RoutingMachine({
  workerPosition,
  destination,
}) {

  const map = useMap();

  useEffect(() => {

    const control = L.Routing.control({
      waypoints: [
        L.latLng(workerPosition[0], workerPosition[1]),
        L.latLng(destination[0], destination[1]),
      ],
      addWaypoints: false,
      draggableWaypoints: false,
    }).addTo(map);

    return () => map.removeControl(control);

  }, [workerPosition, destination]);

  return null;
}