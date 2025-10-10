import { useNavigate, useParams } from "react-router-dom";
import { FaGlobe, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const ManageZones = () => {
  const navigate = useNavigate();
  const { cityId, departmentId } = useParams();

  const actions = [
    {
      title: "View All Zones",
      icon: <FaGlobe size={24} />,
      bgColor: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
      onClick: () => navigate(`/zones/view/${departmentId}`),
    },
    {
      title: "Create Zone",
      icon: <FaPlus size={24} />,
      bgColor: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      onClick: () => navigate(`/zones/create-zone/${departmentId}`),
    },
    {
      title: "Update Zone",
      icon: <FaEdit size={24} />,
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      onClick: () => navigate(`/zones/update-zone/${departmentId}`),
    },
    {
      title: "Delete Zone",
      icon: <FaTrash size={24} />,
      bgColor: "bg-red-600",
      hoverColor: "hover:bg-red-700",
      onClick: () => navigate(`/zones/delete-zone/${departmentId}`),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-12 text-gray-800">Zone Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl">
        {actions.map((action) => (
          <div
            key={action.title}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center gap-3 cursor-pointer ${action.bgColor} ${action.hoverColor} text-white py-8 rounded-2xl shadow-lg transform transition duration-300 hover:-translate-y-2 hover:shadow-2xl`}
          >
            {action.icon}
            <span className="text-lg font-semibold">{action.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageZones;
