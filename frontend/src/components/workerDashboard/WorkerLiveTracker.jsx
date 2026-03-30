import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function WorkerLiveTracker({ onLocation }) {

  useEffect(() => {

    const watchId = navigator.geolocation.watchPosition((pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      socket.emit("worker-location", { lat, lng });

      onLocation([lat, lng]);

    });

    return () => navigator.geolocation.clearWatch(watchId);

  }, []);

  return null;
}