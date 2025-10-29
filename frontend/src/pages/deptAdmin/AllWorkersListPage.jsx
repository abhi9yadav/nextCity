import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import useDeptAdminWorkerData from "../../hooks/useDeptAdminWorkerData";
import WorkerFormModal from "../../components/deptAdmin/WorkerFormModal";

// --- WorkerRow Component ---
const WorkerRow = ({ worker, onEdit, onDelete, onResendInvite }) => {
  const navigate = useNavigate();
  let statusClasses = "";
  let statusIcon = "";
  let statusText = worker.status ? worker.status.toLowerCase() : "unknown";

  switch (statusText) {
    case "active":
      statusClasses = "bg-green-100 text-green-800 border border-green-300";
      statusIcon = "fas fa-check-circle";
      break;
    case "pending":
      statusClasses = "bg-yellow-100 text-yellow-800 border border-yellow-300";
      statusIcon = "fas fa-clock";
      break;
    case "inactive":
      statusClasses = "bg-red-100 text-red-800 border border-red-300";
      statusIcon = "fas fa-ban";
      break;
    default:
      statusClasses = "bg-gray-100 text-gray-600 border border-gray-300";
      statusIcon = "fas fa-question-circle";
      break;
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Name */}
      <td
        onClick={() => navigate(`/dept-admin/worker/${worker._id}`)}
        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer"
        title="View Worker Details"
        >
        {worker.name}
      </td>
      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {worker.email}
      </td>
      {/* Zone */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {worker.zone_name}
      </td>
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${statusClasses}`}
        >
          <i className={`${statusIcon} text-sm`}></i>
          {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
        </span>
      </td>
      {/* Joined Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(worker.createdAt).toLocaleDateString()}
      </td>
      {/* Actions*/}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(worker)}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-sm cursor-pointer"
            title="Edit Worker"
          >
            <i className="fas fa-edit h-5 w-5"></i>
          </button>
          {/* Delete Button */}
          <button
            onClick={() => onDelete(worker._id)}
            className="text-red-600 hover:text-red-900 p-1 rounded-sm cursor-pointer"
            title="Delete Worker"
          >
            <i className="fas fa-trash-alt h-5 w-5"></i>
          </button>
          {/* Resend Invitation Button */}
          {worker.status === "pending" && (
            <button
              onClick={() => onResendInvite(worker._id)}
              className="text-blue-600 hover:text-blue-900 p-1 rounded-sm cursor-pointer"
              title="Resend Invitation"
            >
              <i className="fas fa-envelope h-5 w-5"></i>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const AllWorkersListPage = () => {
  const {
    workers,
    zones,
    loading,
    error,
    zoneFilter,
    setZoneFilter,
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    handleSort,
    currentPage,
    itemsPerPage,
    totalWorkersCount,
    totalPages,
    handlePageChange,
    deleteWorker,
    resendInvitation,
    updateWorker,
  } = useDeptAdminWorkerData();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  // --- DEBOUNCE STATE & REFS ---
  const [searchQuery, setSearchQuery] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(searchQuery, 800);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setSearchTerm(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm]);

  // --- Action Handlers ---
  const handleEditClick = (worker) => {
    setEditingWorker(worker);
    setIsEditModalOpen(true);
  };

  const handleEditFormSubmit = async (data) => {
    try {
      await updateWorker(data);
      setIsEditModalOpen(false);
      setEditingWorker(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteClick = async (workerId) => {
    await deleteWorker(workerId);
  };

  const handleResendInvitationClick = async (workerId) => {
    await resendInvitation(workerId);
  };

  const handleZoneFilterChange = (e) => {
    setZoneFilter(e.target.value);
    handlePageChange(1);
  };

  // --- Render Logic (Loading/Error/Main Content) ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
        <p className="ml-3 text-lg font-medium">Loading workers data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
        <p className="text-lg font-medium text-red-600">
          Error loading workers: {error.message}
        </p>
      </div>
    );
  }
  const startIndex = (currentPage - 1) * itemsPerPage + 1;

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        All Staffs Of Your Department
      </h1>

      {/* Top Controls: Search, Filter, Add Worker Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"></i>
        </div>

        {/* Zone Filter */}
        <div className="relative w-full sm:w-1/4">
          <select
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
            value={zoneFilter}
            onChange={handleZoneFilterChange}
          >
            <option value="">All Zones ({totalWorkersCount})</option>
            {zones.map((zone) => (
              <option key={zone._id} value={zone._id}>
                {zone.zone_name}
              </option>
            ))}
          </select>
          <i className="fas fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"></i>
        </div>

        {/* Add Worker Button */}
        <Link
          to="/dept-admin/workers/add"
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors flex items-center justify-center gap-2"
        >
          <i className="fas fa-user-plus"></i> Add New Worker
        </Link>
      </div>

      {/* Workers Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Name Header (Fixed Clickable Area) */}
              <th
                onClick={() => handleSort("name")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Name
                  <span className="ml-1">
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <i className="fas fa-long-arrow-alt-up inline h-4 w-4"></i>
                      ) : (
                        <i className="fas fa-long-arrow-alt-down inline h-4 w-4"></i>
                      ))}
                  </span>
                </span>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <span className="flex items-center">
                  Zone
                  <span className="ml-1">
                    {sortField === "zone_name" &&
                      (sortOrder === "asc" ? (
                        <i className="fas fa-long-arrow-alt-up inline h-4 w-4"></i>
                      ) : (
                        <i className="fas fa-long-arrow-alt-down inline h-4 w-4"></i>
                      ))}
                  </span>
                </span>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <span className="flex items-center">
                  Status
                  <span className="ml-1">
                    {sortField === "status" &&
                      (sortOrder === "asc" ? (
                        <i className="fas fa-long-arrow-alt-up inline h-4 w-4"></i>
                      ) : (
                        <i className="fas fa-long-arrow-alt-down inline h-4 w-4"></i>
                      ))}
                  </span>
                </span>
              </th>
              <th
                onClick={() => handleSort("createdAt")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <span className="flex items-center">
                  Joined Date
                  <span className="ml-1">
                    {sortField === "createdAt" &&
                      (sortOrder === "asc" ? (
                        <i className="fas fa-long-arrow-alt-up inline h-4 w-4"></i>
                      ) : (
                        <i className="fas fa-long-arrow-alt-down inline h-4 w-4"></i>
                      ))}
                  </span>
                </span>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.length > 0 ? (
              workers.map((worker) => (
                <WorkerRow
                  key={worker._id}
                  worker={worker}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onResendInvite={handleResendInvitationClick}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No workers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalWorkersCount > 0 && (
        <nav className="flex items-center justify-between mt-6 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-md">
          {/* ... (Pagination Logic) ... */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + workers.length - 1, totalWorkersCount)}
                </span>{" "}
                of <span className="font-medium">{totalWorkersCount}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="sr-only">Previous</span>
                  <i
                    className="fas fa-chevron-left h-5 w-5"
                    aria-hidden="true"
                  ></i>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium cursor-pointer text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <i
                    className="fas fa-chevron-right h-5 w-5"
                    aria-hidden="true"
                  ></i>
                </button>
              </nav>
            </div>
          </div>
        </nav>
      )}

      {/* Worker Edit Modal */}
      <WorkerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        worker={editingWorker}
        onSubmit={handleEditFormSubmit}
        zones={zones}
        isDedicatedPage={false}
      />
    </div>
  );
};

export default AllWorkersListPage;
