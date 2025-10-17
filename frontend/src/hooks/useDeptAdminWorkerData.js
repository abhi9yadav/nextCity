import { useState, useEffect, useCallback } from "react";
import {
  fetchWorkers,
  fetchZones,
  createWorker as apiCreateWorker,
  updateWorker as apiUpdateWorker,
  deleteWorker as apiDeleteWorker,
  resendWorkerInvitation as apiResendInvitation,
} from "../api/deptAdminService";
import { toast } from "react-toastify";

const useDeptAdminWorkerData = () => {
  const [workers, setWorkers] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneFilter, setZoneFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalWorkersCount, setTotalWorkersCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [zonesLoaded, setZonesLoaded] = useState(false);

  // --- Handlers (MUST be memoized to avoid re-runs) ---
  const handleSort = useCallback(
    (field) => {
      if (field === sortField) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
      setCurrentPage(1);
    },
    [sortField]
  ); 

  const handlePageChange = useCallback(
    (page) => {
      if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // --- Load Workers Function (Uses handleSort and handlePageChange dependencies indirectly) ---
  const loadWorkers = useCallback(async () => {
    if (!zonesLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: `${sortOrder === "desc" ? "-" : ""}${sortField}`,
        ...(zoneFilter && { zoneId: zoneFilter }),
        ...(searchTerm && { search: searchTerm }),
      };

      const workersRes = await fetchWorkers(params);

      const currentZones = zones;

      const workersWithZoneNames = (workersRes.data.workers || []).map(
        (worker) => {
          const foundZone = currentZones.find((z) => z._id === worker.zone_id);
          return {
            ...worker,
            zone_name: foundZone
              ? foundZone.zone_name
              : worker.zone_name || "Unknown Zone",
          };
        }
      );

      setWorkers(workersWithZoneNames);
      setTotalWorkersCount(workersRes.data.results || 0);
      setTotalPages(Math.ceil((workersRes.data.results || 0) / itemsPerPage));
    } catch (err) {
      console.error("Failed to fetch workers data:", err);
      setError(err);
      toast.error(
        err.response?.data?.message || "Failed to load workers data!"
      );
    } finally {
      setLoading(false);
    }
  }, [
    zoneFilter,
    searchTerm,
    sortField,
    sortOrder,
    currentPage,
    itemsPerPage,
    zones,
    zonesLoaded,
  ]);

  // --- Side Effects ---
  useEffect(() => {
    const loadZones = async () => {
      try {
        const zonesRes = await fetchZones();
        setZones(zonesRes.data.zones || []);
        setZonesLoaded(true);
      } catch (err) {
        console.error("Failed to fetch zones data:", err);
        toast.error("Failed to load zone filters.");
        setZonesLoaded(true);
      }
    };
    loadZones();
  }, []);

  useEffect(() => {
    if (zonesLoaded) {
      loadWorkers();
    }
  }, [loadWorkers, zonesLoaded]);

  // --- CRUD Operations ---
  const createWorker = async (workerData) => {
    const res = await apiCreateWorker(workerData);
    return res.data;
  };

  const updateWorker = async ({ workerId, ...workerData }) => {
    setLoading(true);
    try {
      await apiUpdateWorker({workerId, workerData});
      toast.success("Worker details updated successfully!");
      await loadWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update worker!");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorker = async (workerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this worker? This action cannot be undone."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      await apiDeleteWorker(workerId);
      toast.success("Worker deleted permanently.");
      await loadWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete worker!");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (workerId) => {
    setLoading(true);
    try {
      const res = await apiResendInvitation(workerId);
      console.log(`returned with response: `, res);
      toast.info(res.data.message);
      await loadWorkers();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend invitation!"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    workers,
    zones,
    loading,
    error,
    zoneFilter,
    setZoneFilter,
    searchTerm,
    setSearchTerm,
    sortField,
    sortOrder,
    handleSort, 
    currentPage,
    itemsPerPage,
    totalWorkersCount,
    totalPages,
    handlePageChange,
    refreshWorkers: loadWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    resendInvitation,
  };
};

export default useDeptAdminWorkerData;
