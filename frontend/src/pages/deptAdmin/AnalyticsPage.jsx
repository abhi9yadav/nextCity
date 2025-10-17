// src/pages/deptAdmin/AnalyticsPage.jsx
import React from "react";
import useDeptAdminData from "../../hooks/useDeptAdminData";
import { ComplaintsByStatusChart } from "../../components/deptAdmin/charts/ComplaintsByStatusChart";
import { ZoneLoadBalanceChart } from "../../components/deptAdmin/charts/ZoneLoadBalanceChart";
import Table from "../../components/deptAdmin/Table";
import { KPICard } from "../../components/deptAdmin/KPICard";

const AnalyticsPage = () => {
  const {
    stats,
    complaints,
    topWorkers,
    statusBreakdown,
    zoneLoad,
    loading,
  } = useDeptAdminData();

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-700 font-semibold">
        Loading Analytics...
      </div>
    );

  // KPI cards data
  const kpiData = [
    {
      title: "Total Complaints",
      value: stats.totalComplaints,
      subtitle: "Updated till today",
      icon: "fas fa-ticket-alt",
      color: "blue",
    },
    {
      title: "Complaints in Progress",
      value: stats.complaintsInProgress,
      subtitle: "Need urgent attention",
      icon: "fas fa-clock",
      color: "orange",
    },
    {
      title: "Total Workers",
      value: stats.totalWorkers,
      subtitle: "Managing all zones",
      icon: "fas fa-hard-hat",
      color: "green",
    },
    {
      title: "Average Worker Rating",
      value: stats.averageWorkerRating,
      subtitle: "Next review due next wk",
      icon: "fas fa-star",
      color: "yellow",
      rating: true,
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* --------- KPI Cards --------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((data, index) => (
          <KPICard key={index} {...data} />
        ))}
      </div>

      {/* --------- Complaints by Status --------- */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-lg font-semibold mb-4">Complaints by Status</h2>
        <ComplaintsByStatusChart data={statusBreakdown} />
      </div>

      {/* --------- Zone Load Balance (Scrollable) --------- */}
      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <ZoneLoadBalanceChart data={zoneLoad} />
      </div>

      {/* --------- Top Complaints Table --------- */}
      {complaints.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4">Top Complaints</h2>
          <Table
            columns={["ID", "Title", "Status", "Votes", "Assigned Worker"]}
            data={complaints.map((c) => [
              c._id,
              c.title,
              typeof c.status === "object" ? c.status?.name || "N/A" : c.status,
              c.votesCount,
              typeof c.assignedTo === "object"
                ? c.assignedTo?.name || "Unassigned"
                : c.assignedTo || "Unassigned",
            ])}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
