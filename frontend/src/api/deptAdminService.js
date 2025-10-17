import api from "./base";

// ---------------- DASHBOARD & KPI ----------------

export const fetchDashboardKPIs = async () => {
  const res = await api.get("/dept-admin/dashboard/stats");
  return res.data;
};

// ---------------- COMPLAINTS ----------------

export const fetchComplaints = (params) => {
  return api.get("/dept-admin/complaints", { params });
};

export const fetchCandidateWorkers = (complaintId) => {
  const res =  api.get(`/dept-admin/complaints/${complaintId}/candidates`);
  return res;
};

export const assignComplaintToWorker = (complaintId, workerId) => {
  const res =  api.post(`/dept-admin/complaints/${complaintId}/assign`, { workerId });
  return res;
};

export const fetchComplaintDetails = (complaintId) => {
  const res = api.get(`/dept-admin/complaints/${complaintId}/details`);
  return res;
};

// ---------------- WORKERS ----------------

export const fetchZones = () => {
    return api.get('/dept-admin/zones');
};

export const fetchWorkers = (params) => {
  return api.get("/dept-admin/workers", { params });
};

export const fetchWorkerDetails = (workerId) => {
  return  api.get(`/dept-admin/worker/${workerId}/details`);
};

export const createWorker = (workerData) => {
  return api.post("/dept-admin/workers/create", workerData);
};

export const updateWorker = ({workerId, workerData}) => {
    return api.patch(`/dept-admin/workers/${workerId}`, workerData);
};

export const deleteWorker = (workerId) => {
    console.log(`goint to delete worker id: ${workerId}`);
    return api.delete(`/dept-admin/workers/${workerId}`);
};

export const resendWorkerInvitation = (workerId) => {
    return api.post(`/dept-admin/workers/${workerId}/resend-invitation`);
};