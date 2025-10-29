import React, { useState, useEffect } from 'react';

const api = {
    getStats: async () => {
        // MOCK: GET /api/worker/stats
        await new Promise(res => setTimeout(res, 500));
        return { totalAssigned: 8, resolved: 3, inProgress: 2, pendingAssignment: 3 };
    },
    getAssignedComplaints: async () => {
        // MOCK: GET /api/worker/complaints
        await new Promise(res => setTimeout(res, 800));
        return [
            { _id: 'CMPT-101', title: 'Streetlight outage on Elm Street', status: 'Assigned', department_name: 'Electricity' },
            { _id: 'CMPT-102', title: 'Leaking pipe near downtown park', status: 'InProgress', department_name: 'Water Supply' },
            { _id: 'CMPT-103', title: 'Overflowing dumpster behind library', status: 'Assigned', department_name: 'Garbage Disposal' },
            { _id: 'CMPT-105', title: 'Pothole on 5th Avenue', status: 'Resolved', department_name: 'Road Maintenance' },
        ];
    },
    updateStatus: async (complaintId, status, remarks) => {
        // MOCK: PUT /api/worker/complaints/{complaintId}/status
        console.log(`Updating ${complaintId} to ${status} with remarks: "${remarks}"`);
        await new Promise(res => setTimeout(res, 1000));
        return { success: true };
    }
};


const StatusBadge = ({ status }) => {
    const styles = {
        Assigned: "bg-blue-100 text-blue-800",
        InProgress: "bg-yellow-100 text-yellow-800",
        Resolved: "bg-green-100 text-green-800",
    };
    return (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

const WorkerDashboardPage = () => {
    const [stats, setStats] = useState({});
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState(null); // For the update modal
    const [updateStatus, setUpdateStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, complaintsData] = await Promise.all([
                    api.getStats(),
                    api.getAssignedComplaints()
                ]);
                setStats(statsData);
                setComplaints(complaintsData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const handleOpenModal = (complaint) => {
        setSelectedComplaint(complaint);
        // Default next status suggestion
        setUpdateStatus(complaint.status === 'Assigned' ? 'InProgress' : 'Resolved');
        setRemarks('');
    };
    
    const handleCloseModal = () => {
        setSelectedComplaint(null);
        setIsUpdating(false);
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await api.updateStatus(selectedComplaint._id, updateStatus, remarks);
            // Update the UI instantly for better UX
            setComplaints(prev => prev.map(c => 
                c._id === selectedComplaint._id ? { ...c, status: updateStatus } : c
            ));
            handleCloseModal();
        } catch (error) {
            alert("Failed to update status.");
            setIsUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center p-10">Loading Worker Dashboard...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Worker Dashboard</h1>
            <p className="text-gray-500 mb-8">Welcome! Here are your assigned tasks.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h2 className="text-gray-500">Pending Assignment</h2>
                    <p className="text-3xl font-bold">{stats.pendingAssignment}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <h2 className="text-gray-500">In Progress</h2>
                    <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h2 className="text-gray-500">Resolved</h2>
                    <p className="text-3xl font-bold">{stats.resolved}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500">
                    <h2 className="text-gray-500">Total Assigned</h2>
                    <p className="text-3xl font-bold">{stats.totalAssigned}</p>
                </div>
            </div>

            {/* Assigned Complaints Table */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Your Task List</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3">Complaint ID</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm">{c._id}</td>
                                    <td className="p-3">{c.title}</td>
                                    <td className="p-3 text-gray-600">{c.department_name}</td>
                                    <td className="p-3"><StatusBadge status={c.status} /></td>
                                    <td className="p-3">
                                        <button 
                                            onClick={() => handleOpenModal(c)}
                                            disabled={c.status === 'Resolved'}
                                            className="bg-indigo-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Status Update Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">Update Complaint Status</h2>
                        <p className="mb-4 text-sm text-gray-600">ID: {selectedComplaint._id}</p>
                        <form onSubmit={handleStatusUpdate}>
                            <div className="mb-4">
                                <label className="block font-semibold mb-1">New Status</label>
                                <select 
                                    value={updateStatus}
                                    onChange={e => setUpdateStatus(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="InProgress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block font-semibold mb-1">Remarks (Optional)</label>
                                <textarea
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    placeholder="e.g., Repair completed, site cleared."
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={handleCloseModal} className="text-gray-600">Cancel</button>
                                <button type="submit" disabled={isUpdating} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                                    {isUpdating ? 'Updating...' : 'Confirm'}
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
