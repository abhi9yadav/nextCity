import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import RoutingMachine from "./RoutingMachine";
import WorkerLiveTracker from "./WorkerLiveTracker";
import HeatMapLayer from "./HeatMapLayer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Worker Icon
const workerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

// Task Icon
const taskIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -25],
});

export default function WorkerMap({
  tasks,
  selectedTask,
  workerPosition,
  setWorkerPosition,
  onSelectTask,
}) {

  const center =
    workerPosition ||
    (tasks?.[0]?.location?.coordinates
      ? [
          tasks[0].location.coordinates[1],
          tasks[0].location.coordinates[0],
        ]
      : [28.6139, 77.2090]);

  return (
    <MapContainer center={center} zoom={13} className="w-full h-full">

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <WorkerLiveTracker onLocation={setWorkerPosition} />

      {/* Worker Marker */}
      {workerPosition && (
        <Marker position={workerPosition} icon={workerIcon}>
          <Popup>
            <strong>Your Location</strong>
          </Popup>
        </Marker>
      )}

      {/* Complaint Markers */}
      {tasks.map((task) => {
        if (!task.location?.coordinates) return null;

        const coords = [
          task.location.coordinates[1],
          task.location.coordinates[0],
        ];

        return (
          <Marker
            key={task._id}
            position={coords}
            icon={taskIcon}
            eventHandlers={{
              click: () => onSelectTask(task),
            }}
          >
            <Popup>
              <strong>{task.title}</strong>
              <br />
              {task.location?.address}
            </Popup>
          </Marker>
        );
      })}

      {/* Routing */}
      {selectedTask && workerPosition && (
        <RoutingMachine
          workerPosition={workerPosition}
          destination={[
            selectedTask.location.coordinates[1],
            selectedTask.location.coordinates[0],
          ]}
        />
      )}

      <HeatMapLayer tasks={tasks} />

    </MapContainer>
  );
}