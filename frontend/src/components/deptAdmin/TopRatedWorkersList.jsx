import { useNavigate } from "react-router-dom";

const WorkerRatingItem = ({ worker }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center">
      <img
        className="w-10 h-10 rounded-full object-cover mr-3"
        src={worker.photoURL}
        alt={worker.name}
      />
      <div>
        <p className="text-sm font-semibold text-gray-800">{worker.name}</p>
        <p className="text-xs text-gray-500">{worker.zone} Zone</p>
      </div>
    </div>
    <div className="flex items-center">
      <i className="fas fa-star text-yellow-500 text-xs mr-1"></i>
      <span className="text-sm font-bold text-gray-700">{worker.rating}</span>
    </div>
  </div>
);

export const TopRatedWorkersList = ({ topWorkers }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Top Rated Workers
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Based on citizen satisfaction scores.
      </p>

      <div className="space-y-2">
        {topWorkers.map((worker) => (
          <WorkerRatingItem key={worker._id} worker={worker} />
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer"
          onClick={() => navigate("/dept-admin/workers/list")}
        >
          View All Workers
        </button>
      </div>
    </div>
  );
};
