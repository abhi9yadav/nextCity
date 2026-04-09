import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/authContext";
import { useTheme } from "../../hooks/useTheme";
// Components
import WorkerMap from "./WorkerMap";
import FloatingTaskCard from "./FloatingTaskCard";
import CompletionModal from "./CompletionModal";
import ComplaintsTable from "./ComplaintsTable"; 

export default function WorkerDailyTasks() {
  const { token } = useAuth();
  const { theme } = useTheme();
  
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [workerPosition, setWorkerPosition] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false); // Mobile ke liye

  // Fetch tasks for the worker
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/v1/worker/complaints", {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Fetched tasks:", res.data);
        // Sirf wahi tasks dikhao jo open ya in-progress hain
        const activeTasks = res.data.filter(t => t.status !== "RESOLVED");
        setTasks(activeTasks);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    };
    fetchTasks();
  }, [token]);

  console.log("Fetched tasks:", tasks);

  // Update Status API function
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/v1/worker/complaints/${selectedTask._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setTasks(tasks.map(t => t._id === selectedTask._id ? { ...t, status: newStatus } : t));
      setSelectedTask({ ...selectedTask, status: newStatus });
      
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Jab list me task select ho
  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setIsMapVisible(true); // Mobile pe map kholne ke liye
  };

  return (
    <div className={`h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden ${theme.appBg}`}>
      
      {/* LEFT PANEL: Task List (Hidden on mobile if map is active) */}
      <div className={`w-full lg:w-1/3 xl:w-2/5 h-full overflow-y-auto border-r ${theme.cardBorder} ${isMapVisible ? 'hidden lg:block' : 'block'}`}>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${theme.textDefault}`}>Today's Tasks</h2>
              <p className={`text-sm ${theme.textSubtle}`}>You have {tasks.length} active tasks</p>
            </div>
          </div>

          {/* List of Tasks (You can replace this with your full ComplaintsTable if you prefer) */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task._id} 
                onClick={() => handleSelectTask(task)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTask?._id === task._id 
                    ? `border-indigo-500 bg-indigo-500/10 ${theme.cardShadow}` 
                    : `${theme.cardBorder} ${theme.cardBg} hover:border-indigo-400/50`
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${theme.textDefault} line-clamp-1`}>{task.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium 
                    ${task.status === 'ON_THE_WAY' ? 'bg-blue-100 text-blue-700' : 
                      task.status === 'ARRIVED' ? 'bg-orange-100 text-orange-700' : 
                      'bg-gray-100 text-gray-700'}`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className={`text-xs ${theme.textSubtle} line-clamp-2`}>{task.location?.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Map & Controls */}
      <div className={`w-full lg:w-2/3 xl:w-3/5 h-full relative ${!isMapVisible ? 'hidden lg:block' : 'block'}`}>
        
        {/* Mobile Back Button */}
        {isMapVisible && (
          <button 
            onClick={() => setIsMapVisible(false)}
            className="lg:hidden absolute top-4 left-4 z-[2000] bg-white text-gray-800 p-2 rounded-lg shadow-lg font-medium"
          >
            ← Back to List
          </button>
        )}

        {/* The Leaflet Map */}
        <div className="w-full h-full z-0 relative">
          <WorkerMap
            tasks={tasks}
            selectedTask={selectedTask}
            workerPosition={workerPosition}
            setWorkerPosition={setWorkerPosition}
            onSelectTask={handleSelectTask}
          />
        </div>
        
        {/* The Action Card (Floats over the map) */}
        {selectedTask && (
          <FloatingTaskCard 
            task={selectedTask}
            updateStatus={updateStatus}
            showCompletion={() => setShowCompletion(true)}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>

      {/* Final Completion Modal */}
      {showCompletion && (
        <CompletionModal
          task={selectedTask}
          onClose={() => setShowCompletion(false)}
          onSuccess={() => {
             setShowCompletion(false);
             setSelectedTask(null);
             // Remove from list or change status
             setTasks(tasks.filter(t => t._id !== selectedTask._id));
          }}
        />
      )}

    </div>
  );
}