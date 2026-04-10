import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/authContext";
import WorkerMap from "./WorkerMap";
import FloatingTaskCard from "./FloatingTaskCard";
import CompletionModal from "./CompletionModal";

export default function WorkerDashboard() {

  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [workerPosition, setWorkerPosition] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {

    const fetchTasks = async () => {
      try {

        const res = await axios.get(
          `${API_BASE_URL}/worker/complaints`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTasks(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();

  }, [token]);

  const updateStatus = async (status) => {

    if (!selectedTask) return;

    try {

      await axios.patch(
        `${API_BASE_URL}/complaints/${selectedTask._id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks((prev) =>
        prev.map((t) =>
          t._id === selectedTask._id ? { ...t, status } : t
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div className="w-full h-screen relative">

      <WorkerMap
        tasks={tasks}
        selectedTask={selectedTask}
        workerPosition={workerPosition}
        setWorkerPosition={setWorkerPosition}
        onSelectTask={setSelectedTask}
      />

      {selectedTask && (
        <FloatingTaskCard 
          task={selectedTask}
          updateStatus={updateStatus}
          showCompletion={() => setShowCompletion(true)}
        />
      )}

      {showCompletion && (
        <CompletionModal
          task={selectedTask}
          onClose={() => setShowCompletion(false)}
        />
      )}

    </div>
  );
}