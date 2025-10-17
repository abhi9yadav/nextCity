import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchComplaints, fetchZones } from '../api/deptAdminService'; 

const initialFilters = {
    search: '',
    status: 'ALL',
    zoneId: '',
    sort: '-createdAt',
    page: 1,
    limit: 10,
};

export const useDeptAdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [totalResults, setTotalResults] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [zones, setZones] = useState([]);
    const [zoneLoading, setZoneLoading] = useState(true);
    const [zoneError, setZoneError] = useState(null);

    const buildQueryParams = useMemo(() => {
        const params = {};
        
        if (filters.search) params.search = filters.search;
        
        if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    
        if (filters.zoneId) params.zoneId = filters.zoneId;
        
        params.sort = filters.sort;
        params.page = filters.page;
        params.limit = filters.limit;
        
        if (filters.sort === '-votesCount') {
            params.sortByVotes = 'true';
        }

        params.fields = '_id,title,status,createdAt,zoneName,createdBy,assignedTo,votesCount';

        return params;
    }, [filters]);


    //  Data Fetching Logic
    const fetchComplaintsData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const params = buildQueryParams;
        
        try {
            const response = await fetchComplaints(params);
            
            setComplaints(response.data.complaints || []);
            setTotalResults(response.data.results || 0); 
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
            setComplaints([]); 
            setTotalResults(0); 
            setError(err.response?.data?.message || "An error occurred while fetching complaints.");
        } finally {
            setIsLoading(false);
        }
    }, [buildQueryParams]);

    // Data Fetching Logic (Zones)
    const fetchZonesData = useCallback(async () => {
        setZoneLoading(true);
        setZoneError(null);
        try {
            const response = await fetchZones();
            setZones(response.data.zones || []);
        } catch (err) {
            setZoneError(err.response?.data?.message || "Failed to load department zones.");
            setZones([]);
        } finally {
            setZoneLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaintsData();
    }, [fetchComplaintsData]);

    useEffect(() => {
        fetchZonesData();
    }, [fetchZonesData]);

    // Actions to update filters
    const updateFilter = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1,
        }));
    };

    const updatePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return {
        complaints,
        filters,
        totalResults,
        isLoading,
        error,
        updateFilter,
        updatePage,
        refetch: fetchComplaintsData,
        zones,
        zoneLoading,
        zoneError,
    };
};
