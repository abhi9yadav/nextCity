import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardKPIs, fetchComplaints } from '../api/deptAdminService';

const useDeptAdminData = () => {
  const [stats, setStats] = useState({ 
    totalComplaints: 0, 
    complaintsInProgress: 0, 
    totalWorkers: 0, 
    averageWorkerRating: 4.0 
  });
  const [complaints, setComplaints] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [zoneLoad, setZoneLoad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch aggregated dashboard data
      const res = await fetchDashboardKPIs();
      const data = res.data;

      setStats(data.stats || {});
      setStatusBreakdown(data.statusBreakdown || []);
      setZoneLoad(data.zoneLoad || []);
      setComplaints(data.topComplaints || []);
      setTopWorkers(data.topWorkers || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshComplaints = async () => {
    try {
      const complaintsRes = await fetchComplaints({ sort: '-votesCount', limit: 5 });
      setComplaints(complaintsRes.data.complaints || []);
    } catch (err) {
      console.error("Failed to refresh complaints:", err);
    }
  };

  return {
    stats,
    complaints,
    topWorkers,
    statusBreakdown,
    zoneLoad,
    loading,
    error,
    refreshData: loadData,
    refreshComplaints
  };
};

export default useDeptAdminData;
