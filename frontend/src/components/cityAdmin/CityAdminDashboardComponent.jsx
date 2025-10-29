import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

import generalServices_dept from "../../assets/department_images/generalServices_dept.png";
import health_dept from "../../assets/department_images/health_dept.png";
import park_dept from "../../assets/department_images/park_dept.png";
import powerSupply_dept from "../../assets/department_images/powerSupply_dept.png";
import road_dept from "../../assets/department_images/road_dept.png";
import sewage_dept from "../../assets/department_images/sewage_dept.png";
import waste_dept from "../../assets/department_images/waste_dept.png";
import water_dept from "../../assets/department_images/water_dept.png";

const departmentImages = [
  generalServices_dept,
  health_dept,
  park_dept,
  powerSupply_dept,
  road_dept,
  sewage_dept,
  waste_dept,
  water_dept,
];

const CityAdminDashboardComponent = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDeptId, setExpandedDeptId] = useState(null);
  const [cityAdminName, setCityAdminName] = useState("");
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchDepartmentsAndProfile = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not logged in");

        const idToken = await currentUser.getIdToken(true);

        // 1️ Fetch cityAdmin name from backend
        const profileRes = await axios.get(
          `${BASE_URL}/cityAdmin/me`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setCityAdminName(profileRes.data.name || "City Admin");

        // 2️ Fetch departments
        const res = await axios.get(
          `${BASE_URL}/cityAdmin/departments`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setDepartments(res.data);
      } catch (error) {
        console.error("Error fetching departments/profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const truncate = (text, length = 80) =>
    text && text.length > length ? text.slice(0, length) : text;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Welcome {cityAdminName}
      </h1>

      {departments.length === 0 ? (
        <p className="text-center text-gray-500">No departments found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {departments.map((dept, index) => {
            const bgImage = departmentImages[index % departmentImages.length];
            const isExpanded = expandedDeptId === dept._id;

            return (
              <div
                key={dept._id}
                className="relative rounded-2xl shadow-md overflow-hidden cursor-pointer group transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
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
                onClick={(e) => {
                  if (!e.target.closest(".view-more")) {
                    navigate(`/city-admin/${dept._id}`);
                  }

                }}
              >
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

                  {dept.description.length > 80 && (
                    <span
                      onClick={() =>
                        setExpandedDeptId(isExpanded ? null : dept._id)
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
    </div>
  );
};

export default CityAdminDashboardComponent;
