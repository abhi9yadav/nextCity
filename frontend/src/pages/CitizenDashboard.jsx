import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import CitizenComplaintList from "../components/citizenDashboard/CitizenComplaintList";
import Footer from "../components/layout/Footer";
import PageSkeleton from "../components/skeletons/PageSkeleton"; // 🧩 import skeleton loader

const CitizenDashboard = ({ title }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a small delay for loading state (like an API call)
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PageSkeleton count={4} />; // 🦴 show skeleton placeholders
// src/mockData/complaints.js
 const mockComplaints = [
  {
    id: "C001",
    category: "Water Supply",
    title: "No water in Ashoka Nagar for 2 days",
    status: "Pending",
    date: "2025-10-08T10:30:00Z",
    upvotes: 12,
    mediaUrl: "https://placehold.co/400x200/8BC34A/ffffff?text=Water+Issue",
  },
  {
    id: "C002",
    category: "Road Repair",
    title: "Potholes near City Mall are dangerous",
    status: "InProgress",
    date: "2025-10-06T14:15:00Z",
    upvotes: 8,
    mediaUrl: "https://placehold.co/400x200/FF9800/ffffff?text=Road+Issue",
  },
  {
    id: "C003",
    category: "Electricity",
    title: "Frequent power cuts in Sector 5",
    status: "Closed",
    date: "2025-10-05T09:00:00Z",
    upvotes: 25,
    mediaUrl: "https://placehold.co/400x200/03A9F4/ffffff?text=Power+Issue",
  },
  {
    id: "C004",
    category: "Garbage",
    title: "Garbage not collected in Block A for a week",
    status: "Pending",
    date: "2025-10-07T16:20:00Z",
    upvotes: 5,
    mediaUrl: "https://placehold.co/400x200/FF5722/ffffff?text=Garbage+Issue",
  },
  {
    id: "C005",
    category: "Traffic",
    title: "Traffic signal not working at Main Square",
    status: "InProgress",
    date: "2025-10-04T11:10:00Z",
    upvotes: 15,
    mediaUrl: "https://placehold.co/400x200/9C27B0/ffffff?text=Traffic+Issue",
  },
];

  return (
    <div className="bg-green-500/10 ">
      {/* <Header title={title} /> */}
      <CitizenComplaintList complaints={mockComplaints} />
      {/* <Footer /> */}
    </div>
  );
};

export default CitizenDashboard;
