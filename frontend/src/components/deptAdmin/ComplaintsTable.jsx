import { STATUS_TAILWIND_CLASSES } from "../../utils/constants";

const StatusPill = ({ status }) => {
  const classes =
    STATUS_TAILWIND_CLASSES[status] || STATUS_TAILWIND_CLASSES.CLOSED;
  return (
    <span
      className={`inline-flex items-center px-4 py-1 text-xs font-semibold rounded-full ${classes}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export const ComplaintsTable = ({ complaints, onAssignWorker }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Complaints List
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wider bg-gray-50">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Created By</th>
              <th className="px-4 py-3 text-left">Assigned Worker</th>
              <th className="px-4 py-3 text-left">Votes</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-sm">
            {complaints.map((complaint) => (
              <tr key={complaint._id}>
                <td className="px-4 py-4 font-medium text-gray-700">
                  {complaint.title}
                </td>
                <td className="px-4 py-4 text-gray-600">
                  {complaint.createdBy?.name || "N/A"}
                </td>
                <td className="px-4 py-4 text-gray-600">
                  {complaint.assignedTo?.name || "—"}
                </td>
                <td className="px-4 py-4 text-gray-600">
                  {complaint.votesCount || 0}
                </td>
                <td className="px-4 py-4 w-37">
                  <StatusPill status={complaint.status} />
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onAssignWorker(complaint)}
                    disabled={complaint.status === "RESOLVED"}
                    className={`font-semibold text-sm transition-colors 
                    ${
                      complaint.status === "RESOLVED"
                        ? "text-gray-400 cursor-not-allowed opacity-50"
                        : "text-blue-600 hover:text-blue-800 cursor-pointer"
                    }`}
                  >
                    {complaint.assignedTo ? "Reassign" : "Assign Worker"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
