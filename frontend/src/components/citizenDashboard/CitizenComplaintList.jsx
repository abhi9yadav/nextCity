import React, { useState, useEffect, useRef,useCallback } from "react";
import axios from "axios";
import ComplaintCard from "./CitizenComplaintCard";
import CommunityFeed from "./CommunityFeed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/authContext";
import PageSkeleton from "../skeletons/PageSkeleton";
import ComplaintModal from "./ComplaintModal";
import { useTheme } from "../../hooks/useTheme"; // 1. Import useTheme

const CitizenComplaintList = () => {
  const { currentUser, token } = useAuth();
  const { theme } = useTheme(); // 2. Get the theme object

  const [myComplaints, setMyComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("myComplaints");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ... (rest of your component logic remains the same)
  const fetchMyComplaints = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${BASE_URL}/complaints/${currentUser._id}/my`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const complaints = res.data?.data || res.data || [];
      console.log("Fetched complaints:", complaints);
      setMyComplaints(complaints);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      setError("Failed to load complaints. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, token]);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  const handleCardClick = (complaint) => setSelectedComplaint(complaint);
  const handleModalClose = () => setSelectedComplaint(null);

  const handleComplaintUpdate = (updatedComplaint) => {
    setMyComplaints((prev) =>
      prev.map((c) => (c._id === updatedComplaint._id ? updatedComplaint : c))
    );
    setSelectedComplaint(updatedComplaint);
  };

  const handleComplaintDelete = (deletedId) => {
    setMyComplaints((prev) => prev.filter((c) => c._id !== deletedId));
    setSelectedComplaint(null);

  };

// console.log("myComplaints:", myComplaints);
// console.log("type:", typeof myComplaints);

  const totalComplaints = myComplaints.length;
  const resolvedComplaints = myComplaints.filter(
    (c) => c.status === "RESOLVED"
  ).length;


  if (loading) return <PageSkeleton count={4} />;

  // 3. Apply theme to error text
  if (error)
    return (
      <div className={`text-center py-10 ${theme.primaryAccentText} font-medium`}>{error}</div>
    );

  return (
    // The parent MainLayout already sets the main background
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* 4. Apply theme to stats cards */}
          <div className={`p-6 rounded-lg text-center ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
            <p className={`text-sm mb-1 ${theme.textSubtle}`}>Total Complaints Filed</p>
            <p className={`text-4xl font-extrabold ${theme.textDefault}`}>
              {totalComplaints}
            </p>
          </div>
          <div className={`p-6 rounded-lg text-center ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
            <p className={`text-sm mb-1 ${theme.textSubtle}`}>Complaints Resolved</p>
            {/* Using secondary accent for "success" color */}
            <p className={`text-4xl font-extrabold ${theme.secondaryAccentText}`}>
              {resolvedComplaints}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className={`mb-6 border-b ${theme.footerBorder}`}>
          <nav className="flex -mb-px space-x-6">
            {["myComplaints", "communityFeed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                // 5. Apply theme to tabs (active and inactive)
                className={`py-2 px-1 font-semibold text-base transition-colors outline-none ${
                  activeTab === tab
                    ? `border-b-2 ${theme.navActiveBorder} ${theme.primaryAccentText}`
                    : `${theme.textSubtle} ${theme.linkHoverTextAccent}`
                }`}
              >
                {tab === "myComplaints" ? "My Complaints" : "Community Feed"}
              </button>
            ))}
          </nav>
        </div>

        {/* Complaints Grid */}
        {activeTab === "myComplaints" ? (
          totalComplaints > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  onClick={() => handleCardClick(complaint)}
                />
              ))}
            </div>
          ) : (
            // 6. Apply theme to "no complaints" message
            <p className={`text-center ${theme.textSubtle} text-lg mt-8`}>
              No complaints filed yet.
            </p>
          )
        ) : (
          <CommunityFeed />
        )}

        {/* Modal */}
        {selectedComplaint && (
          <ComplaintModal
            complaint={selectedComplaint}
            token={token}
            onClose={handleModalClose}
            onUpdate={handleComplaintUpdate}
            onDelete={handleComplaintDelete}
          />
        )}
      </div>
    </div>
  );
};

export default CitizenComplaintList;