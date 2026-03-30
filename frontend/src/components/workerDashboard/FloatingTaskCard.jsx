export default function FloatingTaskCard({
  task,
  updateStatus,
  showCompletion
}) {
  return (
     <div className="absolute bottom-60 left-1/2 transform -translate-x-1/2 w-[420px] bg-white shadow-xl rounded-xl p-4 z-[1000]">

      <h3 className="font-bold">{task.title}</h3>

      <p className="text-sm text-gray-500">
        {task.location.address}
      </p>

      <div className="flex gap-2 mt-3">

        {task.status === "IN_PROGRESS" && (
          <button
            onClick={() => updateStatus("ON_THE_WAY")}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            Start
          </button>
        )}

        {task.status === "ON_THE_WAY" && (
          <button
            onClick={() => updateStatus("ARRIVED")}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Arrived
          </button>
        )}

        {task.status === "ARRIVED" && (
          <button
            onClick={showCompletion}
            className="flex-1 bg-purple-600 text-white py-2 rounded"
          >
            Complete
          </button>
        )}

      </div>
    </div>
  );
}