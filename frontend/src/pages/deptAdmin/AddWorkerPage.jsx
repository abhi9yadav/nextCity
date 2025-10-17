import { useNavigate } from "react-router-dom";
import WorkerFormModal from "../../components/deptAdmin/WorkerFormModal";
import useDeptAdminWorkerData from "../../hooks/useDeptAdminWorkerData";

const AddWorkerPage = () => {
  const navigate = useNavigate();
  const { zones, createWorker, loading, error } = useDeptAdminWorkerData();

  const handleFormSubmit = async (formData) => {
    try {
      const res = await createWorker(formData);
      return res;
    } catch (err) {
      console.error("Worker creation failed in page handler:", err);
      throw err;
    }
  };

  if (loading && zones.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
        <p className="ml-3 text-lg font-medium">Loading Zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
        <p className="text-lg font-medium text-red-600">
          Error loading zones: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Add New Worker</h1>
        <button
          onClick={() => navigate("/dept-admin/workers")}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Actions
        </button>
      </div>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
        <p className="text-gray-600 mb-6">
          Fill in the details below to add a new worker to your department. An
          invitation email will be sent automatically.
        </p>

        <WorkerFormModal
          isOpen={true}
          worker={null}
          onSubmit={handleFormSubmit}
          zones={zones}
          isDedicatedPage={true}
        />
      </div>
    </div>
  );
};

export default AddWorkerPage;
