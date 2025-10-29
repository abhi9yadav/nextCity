import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import UpdateDepartmentModal from "./SuperAdminModals/UpdateDepartmentModal";

const AllDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDeptId, setExpandedDeptId] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not logged in");

        const idToken = await currentUser.getIdToken(true);
        const res = await axios.get(
          `${BASE_URL}/superAdmin/departments`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        setDepartments(res.data.departments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleUpdateInList = (updatedDept) => {
    setDepartments((prev) =>
      prev.map((d) => (d._id === updatedDept._id ? updatedDept : d))
    );
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const truncate = (text, length = 80) =>
    text && text.length > length ? text.slice(0, length) : text;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">All Departments</h1>

      {departments.length === 0 ? (
        <p className="text-center text-gray-500">No departments found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const isExpanded = expandedDeptId === dept.department_name;
            const bgImage =
              dept.photoURL ||
              "https://via.placeholder.com/400x300?text=No+Image";

            return (
              <div
                key={dept._id}
                className="relative rounded-2xl shadow-md overflow-hidden group transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.05)), url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "290px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "1.5rem",
                }}
              >
                {/* Hover Buttons */}
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDept(dept);
                      setIsModalOpen(true);
                    }}
                    className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow text-lg"
                    title="Edit Department"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete ${dept.department_name}?`)) {
                        const auth = getAuth();
                        const idToken = await auth.currentUser.getIdToken(true);
                        await axios.delete(
                          `${BASE_URL}/superAdmin/departments/${dept._id}`,
                          { headers: { Authorization: `Bearer ${idToken}` } }
                        );
                        setDepartments((prev) =>
                          prev.filter((d) => d._id !== dept._id)
                        );
                      }
                    }}
                    className="bg-white/80 hover:bg-red-100 text-red-600 rounded-full p-2 shadow text-lg"
                    title="Delete Department"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {/* Text Content */}
                <div className="relative z-10 text-white flex flex-col">
                  <h2 className="text-lg font-semibold mb-2">
                    {dept.department_name}
                  </h2>

                  <div
                    className={`text-sm ${
                      isExpanded
                        ? "overflow-y-auto max-h-48"
                        : "overflow-hidden max-h-20"
                    }`}
                  >
                    {isExpanded
                      ? dept.description
                      : truncate(dept.description, 80)}
                  </div>

                  {dept.description?.length > 80 && (
                    <span
                      onClick={() =>
                        setExpandedDeptId(
                          isExpanded ? null : dept.department_name
                        )
                      }
                      className="text-blue-300 hover:underline cursor-pointer mt-2 view-more"
                    >
                      {isExpanded ? "view less" : "view more"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Modal */}
      <UpdateDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDept || {}}
        onUpdate={handleUpdateInList}
      />
    </div>
  );
};

export default AllDepartments;
