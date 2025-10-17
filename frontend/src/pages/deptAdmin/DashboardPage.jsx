import { useState } from "react";
import { toast } from "react-toastify";
import useDeptAdminData from "../../hooks/useDeptAdminData";
import { assignComplaintToWorker } from "../../api/deptAdminService";

import {
  KPICard,
  kpiData as kpiStaticData,
} from "../../components/deptAdmin/KPICard";
import { ComplaintsTable } from "../../components/deptAdmin/ComplaintsTable";
import { TopRatedWorkersList } from "../../components/deptAdmin/TopRatedWorkersList";

import { ComplaintsByStatusChart } from "../../components/deptAdmin/charts/ComplaintsByStatusChart";
import { ZoneLoadBalanceChart } from "../../components/deptAdmin/charts/ZoneLoadBalanceChart";

const DashboardPage = () => {
  const {
    stats,
    complaints,
    topWorkers,
    statusBreakdown,
    zoneLoad,
    loading,
    error,
    refreshData,
    refreshComplaints,
  } = useDeptAdminData();

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const handleAssignWorker = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const res = await assignComplaintToWorker(complaint._id);
      const message = res.data.message;
      refreshData();
      toast.success(message);
    } catch (err) {
      console.error("Auto-Assignment failed:", err);
      alert(
        err.response?.data?.message ||
          "Auto-assignment failed. No workers available."
      );
    }
  };

  const dynamicKpiData = [
    { ...kpiStaticData[0], value: stats.totalComplaints },
    { ...kpiStaticData[1], value: stats.complaintsInProgress },
    { ...kpiStaticData[2], value: stats.totalWorkers },
    { ...kpiStaticData[3], value: stats.averageWorkerRating, rating: true },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
        <p className="ml-3 text-lg font-medium">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-64px)]">
        <p className="text-lg font-medium text-red-600">
          Error loading data: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicKpiData.map((data, index) => (
              <KPICard key={index} {...data} />
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 mt-5">
          <ComplaintsTable
            complaints={complaints}
            onAssignWorker={handleAssignWorker}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 mt-5">
          <TopRatedWorkersList topWorkers={topWorkers} />
        </div>

        <div className="col-span-12 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComplaintsByStatusChart data={statusBreakdown} />
            <ZoneLoadBalanceChart data={zoneLoad} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
