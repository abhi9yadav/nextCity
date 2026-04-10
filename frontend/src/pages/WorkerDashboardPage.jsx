import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext';
import { useTheme } from '../hooks/useTheme';

import StatsGrid from '../components/workerDashboard/StatsGrid';
import AnalyticsSection from '../components/workerDashboard/AnalyticsSection';
import ComplaintsTable from '../components/workerDashboard/ComplaintsTable';
import TableControls from '../components/workerDashboard/TableControls';
import Pagination from '../components/workerDashboard/Pagination';
import CompletionModal from '../components/workerDashboard/CompletionModal';

const WorkerDashboardPage = () => {
  const { theme } = useTheme();
  const { token } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [timeframe, setTimeframe] = useState('Yearly');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // We keep selectedTask for the "Quick Update" inline modal
  const [selectedTask, setSelectedTask] = useState(null);

  const api = useMemo(
    () =>
      axios.create({
        baseURL: 'http://localhost:5000/api/v1/worker',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      }),
    [token]
  );

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get('/complaints');
      const data = res.data;

      setComplaints(data);

      setStats({
        resolved: data.filter((c) => c.status === 'RESOLVED').length,
        inProgress: data.filter((c) => c.status === 'IN_PROGRESS').length,
        pendingAssignment: data.filter((c) => c.status === 'OPEN').length,
        reopened: data.filter((c) => c.status === 'REOPEN').length,
      });
    };

    fetchData();
  }, [api]);

  useEffect(() => {
    if (!Array.isArray(complaints)) return;

    const now = new Date();

    const filtered = complaints.filter(c => {
      const created = new Date(c.createdAt);

      if (timeframe === "Daily") {
        return created.toDateString() === now.toDateString();
      }

      if (timeframe === "Weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return created >= weekAgo;
      }

      if (timeframe === "Monthly") {
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      }

      if (timeframe === "Yearly") {
        return created.getFullYear() === now.getFullYear();
      }

      return true;
    });

    setStats({
      inProgress: filtered.filter(c => c.status === "IN_PROGRESS").length,
      resolved: filtered.filter(c => c.status === "RESOLVED").length,
      reopened: filtered.filter(c => c.status === "REOPEN").length,
    });
  }, [timeframe, complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch = c.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const requestSort = (key) => {
    setSortConfig({ key, direction: 'ascending' });
  };

  const handleOpenModal = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Worker Dashboard</h1>

      <StatsGrid stats={stats} />

      <AnalyticsSection
        stats={stats}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      <div className={`p-6 rounded-lg ${theme.cardBg}`}>
        <TableControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          complaints={complaints}
        />

        <ComplaintsTable
          complaints={paginated}
          handleOpenModal={handleOpenModal}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

        {/* Keeping the CompletionModal for the "Quick Update" button */}
        {selectedTask && (
          <CompletionModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WorkerDashboardPage;