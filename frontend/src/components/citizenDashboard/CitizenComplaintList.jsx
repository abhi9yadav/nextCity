import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ComplaintCard from "./CitizenComplaintCard";
import CommunityFeed from "./CommunityFeed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/authContext";
import PageSkeleton from "../skeletons/PageSkeleton";
import ComplaintModal from "./ComplaintModal";

const CitizenComplaintList = () => {
  const { currentUser, token } = useAuth();

  const [myComplaints, setMyComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("myComplaints");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const totalComplaints = myComplaints.length;
  const resolvedComplaints = myComplaints.filter(
    (c) => c.status === "Closed"
  ).length;

  if (loading) return <PageSkeleton count={4} />;

  if (error)
    return (
      <div className="text-center py-10 text-red-600 font-medium">{error}</div>
    );

  return (
    <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <FontAwesomeIcon
              className="text-blue-600 text-xl mb-2"
              icon="fa-solid fa-chart-simple"
            />
            <p className="text-sm text-gray-500 mb-1">Total Complaints Filed</p>
            <p className="text-4xl font-extrabold text-gray-800">
              {totalComplaints}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">Complaints Resolved</p>
            <p className="text-4xl font-extrabold text-green-600">
              {resolvedComplaints}
            </p>
          </div>
        </div>

        {/*  Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-6">
            {["myComplaints", "communityFeed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 font-semibold text-base transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
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
                <div
                  key={complaint._id}
                  onClick={() => handleCardClick(complaint)}
                  className="cursor-pointer"
                >
                  <ComplaintCard complaint={complaint} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg mt-8">
              No complaints filed yet.
            </p>
          )
        ) : (
          <CommunityFeed />
        )}

        {/*  Modal */}
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
