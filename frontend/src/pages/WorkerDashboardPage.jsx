import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authContext/index';
import StatsGrid from '../components/workerDashboard/StatsGrid';
import AnalyticsSection from '../components/workerDashboard/AnalyticsSection';
import ComplaintsTable from '../components/workerDashboard/ComplaintsTable';
import { useTheme } from '../hooks/useTheme'; // 1. Import useTheme

const WorkerDashboardPage = () => {
  const { theme } = useTheme(); // 2. Get the theme object
  const { token } = useAuth();
  
  // State remains the same...
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [timeframe, setTimeframe] = useState('Monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // --- Local Themed Components ---
  // Moved inside to access the `theme` hook
  const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
      const timer = setTimeout(() => onDismiss(), 3000);
      return () => clearTimeout(timer);
    }, [onDismiss]);

    const styles = {
      success: theme.successBg || 'bg-green-500',
      error: theme.errorBg || 'bg-red-500',
    };
    return <div className={`fixed bottom-5 right-5 text-white px-6 py-3 rounded-lg shadow-lg z-50 ${styles[type]}`}>{message}</div>;
  };

  const SkeletonStatCard = () => (
    <div className={`p-6 rounded-lg animate-pulse ${theme.cardBg}`}>
      <div className={`h-4 rounded w-3/4 mb-3 ${theme.sectionBgTranslucent}`}></div>
      <div className={`h-8 rounded w-1/2 ${theme.sectionBgTranslucent}`}></div>
    </div>
  );

  const SkeletonTableRow = () => (
    <tr className={`border-b animate-pulse ${theme.footerBorder}`}>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="p-3"><div className={`h-4 rounded ${theme.sectionBgTranslucent}`}></div></td>
      ))}
    </tr>
  );

  // ... (rest of your logic and useEffects remain the same)
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
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/complaints');
        const complaintsData = res.data;
        setComplaints(complaintsData);

        const stats = {
          totalAssigned: complaintsData.length,
          resolved: complaintsData.filter((c) => c.status === 'RESOLVED').length,
          inProgress: complaintsData.filter((c) => c.status === 'IN_PROGRESS').length,
          pendingAssignment: complaintsData.filter((c) => c.status === 'OPEN').length,
          reopened: complaintsData.filter((c) => c.status === 'REOPEN').length,
        };
        setStats(stats);
      } catch (err) {
        setError('Failed to load dashboard data. Please try refreshing the page.');
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const filteredAndSortedComplaints = useMemo(() => {
    let sortedItems = [...complaints];
    sortedItems = sortedItems.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    sortedItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sortedItems;
  }, [complaints, searchTerm, statusFilter, sortConfig]);

  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedComplaints.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedComplaints, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedComplaints.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    let nextStatus = 'IN_PROGRESS';
    if (complaint.status === 'IN_PROGRESS') nextStatus = 'RESOLVED';
    else if (complaint.status === 'RESOLVED') nextStatus = 'REOPEN';
    setUpdateStatus(nextStatus);
    setRemarks('');
  };

  const handleCloseModal = () => { setSelectedComplaint(null); setIsUpdating(false); };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, { status: updateStatus, remarks });
      setNotification({ message: 'Status updated successfully!', type: 'success' });
      handleCloseModal();
      const updatedComplaints = complaints.map((c) => c._id === selectedComplaint._id ? { ...c, status: updateStatus } : c);
      setComplaints(updatedComplaints);
      // Update stats dynamically after successful update
      const newStats = {
        totalAssigned: updatedComplaints.length,
        resolved: updatedComplaints.filter((c) => c.status === 'RESOLVED').length,
        inProgress: updatedComplaints.filter((c) => c.status === 'IN_PROGRESS').length,
        pendingAssignment: updatedComplaints.filter((c) => c.status === 'OPEN').length,
        reopened: updatedComplaints.filter((c) => c.status === 'REOPEN').length,
      };
      setStats(newStats);
    } catch (error) {
      setNotification({ message: 'Failed to update status.', type: 'error' });
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };


  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen p-8 font-sans">
        <div className={`h-8 rounded w-1/3 mb-2 animate-pulse ${theme.sectionBgTranslucent}`}></div>
        <div className={`h-4 rounded w-1/2 mb-8 animate-pulse ${theme.sectionBgTranslucent}`}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className={`${theme.cardBg} p-6 rounded-lg ${theme.cardShadow}`}>
          <div className={`h-6 rounded w-1/4 mb-4 animate-pulse ${theme.sectionBgTranslucent}`}></div>
          <table className="w-full">
            <tbody>{[...Array(5)].map((_, i) => <SkeletonTableRow key={i} />)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className={`text-center p-10 min-h-screen flex items-center justify-center ${theme.primaryAccentText} ${theme.sectionBgTranslucent}`}>
        {error}
      </div>
    );

  const inputClasses = `p-2 border rounded-md bg-transparent ${theme.cardBorder} ${theme.textDefault} focus:ring-2 focus:${theme.navActiveBorder}`;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      {notification && <Toast message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}

      <h1 className={`text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${theme.headingGradientFrom} ${theme.headingGradientTo}`}>
        Worker Dashboard
      </h1>
      <p className={`${theme.textSubtle} mb-8`}>Welcome! Here are your assigned tasks.</p>

      <StatsGrid stats={stats} />
      <AnalyticsSection stats={stats} timeframe={timeframe} setTimeframe={setTimeframe} />

      <div className={`p-6 rounded-lg ${theme.cardBg} ${theme.cardShadow} ${theme.cardBorder}`}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className={`text-xl font-bold ${theme.textDefault}`}>Your Task List</h2>
          <div className="flex items-center gap-4">
            <input type="text" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClasses} w-48`} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClasses}>
              <option value="All">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPEN">Reopened</option>
            </select>
          </div>
        </div>

        <ComplaintsTable complaints={paginatedComplaints} handleOpenModal={handleOpenModal} sortConfig={sortConfig} requestSort={requestSort} />

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 font-semibold rounded disabled:opacity-50 ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo}`}>
              Previous
            </button>
            <span className={theme.textSubtle}>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-2 font-semibold rounded disabled:opacity-50 ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo}`}>
              Next
            </button>
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-8 w-full max-w-md ${theme.cardBg} ${theme.cardBorder} ${theme.cardShadow}`}>
            <h2 className={`text-xl font-bold mb-2 ${theme.textDefault}`}>Update Complaint Status</h2>
            <p className={`mb-4 text-sm ${theme.textSubtle}`}>ID: {selectedComplaint._id}</p>
            <form onSubmit={handleStatusUpdate}>
              <div className="mb-4">
                <label className={`block font-semibold mb-1 ${theme.textSubtle}`}>New Status</label>
                <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} className={inputClasses}>
                  {selectedComplaint.status === 'OPEN' && <option value="IN_PROGRESS">In Progress</option>}
                  {selectedComplaint.status === 'IN_PROGRESS' && <option value="RESOLVED">Resolved</option>}
                  {selectedComplaint.status === 'RESOLVED' && <option value="REOPEN">Reopen</option>}
                  {selectedComplaint.status === 'REOPEN' && <option value="IN_PROGRESS">In Progress</option>}
                </select>
              </div>
              <div className="mb-4">
                <label className={`block font-semibold mb-1 ${theme.textSubtle}`}>Remarks</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputClasses} rows="3" placeholder="Add remarks (optional)" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleCloseModal} className={`px-4 py-2 rounded-md font-semibold ${theme.buttonSecondaryText} bg-gradient-to-r ${theme.buttonSecondaryBgFrom} ${theme.buttonSecondaryBgTo} ${theme.buttonSecondaryHoverBgFrom} ${theme.buttonSecondaryHoverBgTo}`}>
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className={`px-4 py-2 rounded-md font-semibold disabled:opacity-50 ${theme.buttonPrimaryText} bg-gradient-to-r ${theme.buttonPrimaryBgFrom} ${theme.buttonPrimaryBgTo} ${theme.buttonPrimaryHoverBgFrom} ${theme.buttonPrimaryHoverBgTo}`}>
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboardPage;