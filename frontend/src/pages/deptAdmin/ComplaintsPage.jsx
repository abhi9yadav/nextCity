import { useState, useEffect } from "react";
import { useDeptAdminComplaints } from "../../hooks/useDeptAdminComplaints";
import { useDebounce } from "../../hooks/useDebounce";
import AssignmentModal from "../../components/deptAdmin/AssignmentModal";
import ComplaintCard from "../../components/deptAdmin/ComplaintCard";
import ComplaintDetailModal from "../../components/deptAdmin/ComplaintDetailModal";
import { assignComplaintToWorker } from "../../api/deptAdminService";
import { toast } from "react-toastify";

import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  Pagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REOPENED", label: "Reopened" },
];

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Latest (Default)" },
  { value: "createdAt", label: "Oldest" },
  { value: "-votesCount", label: "Most Votes" },
  { value: "votesCount", label: "Least Votes" },
  { value: "status", label: "Status A-Z" },
];

const HEADERS = [
  { id: "title", label: "Complaint ID/Title" },
  { id: "zoneName", label: "Zone" },
  { id: "status", label: "Status" },
  { id: "votesCount", label: "Votes" },
  { id: "assignedTo", label: "Assigned To" },
  { id: "createdAt", label: "Date Filed" },
  { id: "actions", label: "Actions" },
];

const PENDING_ASSIGN_STATUS = "PENDING_ASSIGN";

const ComplaintsPage = () => {
  const {
    complaints,
    filters,
    totalResults,
    isLoading,
    error,
    updateFilter,
    refetch,
    updatePage,
    zones,
    zoneLoading,
    zoneError,
  } = useDeptAdminComplaints();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [searchQuery, setSearchQuery] = useState(filters.search);
  const debouncedSearchTerm = useDebounce(searchQuery, 500); 

  // State to handle the assignment modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  const openActionMenu = Boolean(actionAnchorEl);
  const isPendingFilterActive = filters.status === PENDING_ASSIGN_STATUS;

  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      updateFilter('search', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, filters.search, updateFilter]);

  const handlePendingAssignmentToggle = () => {
    if (isPendingFilterActive) {
      updateFilter("status", "ALL");
    } else {
      updateFilter("status", PENDING_ASSIGN_STATUS);
    }
  };

  const handleOpenActionMenu = (event, complaintId) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedComplaintId(complaintId);
  };

  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
  };

  const handleAssignManually = () => {
    handleCloseActionMenu();
    setAssignmentModalOpen(true);
  };

  // Auto-Assign action 
  const handleAutoAssign = async () => {
    handleCloseActionMenu();
    if (isAutoAssigning) return;

    setIsAutoAssigning(true);
    const complaintToAssign = selectedComplaintId;

    try {
      const res = await assignComplaintToWorker(complaintToAssign);
      const message = res.data.message;
      refetch();
      toast.success(message);
    } catch (err) {
      console.error("Auto-Assignment failed:", err);
      alert(
        err.response?.data?.message ||
          "Auto-assignment failed. No workers available."
      );
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleViewDetails = (complaintId) => {
    setSelectedComplaintId(complaintId);
    setDetailModalOpen(true);
  };

  const renderStatusBadge = (status) => {
    let color = "gray";
    if (status === "OPEN") color = "error";
    if (status === "IN_PROGRESS") color = "warning";
    if (status === "RESOLVED") color = "success";
    if (status === "REOPENED") color = "info";
    if (status === "CLOSED") color = "primary";

    return (
      <Typography
        component="span"
        variant="caption"
        sx={{
          bgcolor: `${color}.main`,
          color: "white",
          borderRadius: 1,
          px: 1,
          py: 0.5,
        }}
      >
        {status.replace("_", " ")}
      </Typography>
    );
  };

  const renderContent = () => {
    const data = complaints || [];

    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (data.length === 0) {
      return (
        <Alert severity="warning">
          No complaints found matching current filters.
        </Alert>
      );
    }

    // Mobile Card View
    if (isMobile) {
      return (
        <Box>
          {data.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              renderStatusBadge={renderStatusBadge}
              handleOpenActionMenu={handleOpenActionMenu}
              handleViewDetails={handleViewDetails}
              isAutoAssigning={isAutoAssigning}
            />
          ))}
        </Box>
      );
    }
    // Desktop Table View
    return (
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {HEADERS.map((header) => (
                <TableCell key={header.id} sx={{ fontWeight: "bold" }}>
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((complaint) => {
              const isAssignable =
                complaint.status === "OPEN" || complaint.status === "REOPENED";
              return (
                <TableRow key={complaint._id} hover>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => handleViewDetails(complaint._id)}
                    >
                      {complaint._id.slice(-4)} / {complaint.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{complaint.zoneName || "N/A"}</TableCell>
                  <TableCell>{renderStatusBadge(complaint.status)}</TableCell>
                  <TableCell>{complaint.votesCount}</TableCell>
                  <TableCell>
                    {complaint.assignedTo?.name || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {isAssignable && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => handleOpenActionMenu(e, complaint._id)}
                        sx={{ mr: 1 }}
                      >
                        ASSIGN
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(complaint._id)}
                    >
                      <span role="img" aria-label="details">
                        👁️
                      </span>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // MAIN RENDER

  const totalPages = Math.ceil(totalResults / filters.limit);

  const handlePageChange = (event, newPage) => {
    updatePage(newPage);
  };

  const zoneOptions = zones.map((z) => ({ value: z._id, label: z.zone_name }));
  const zoneDropdownContent = zoneLoading ? (
    <MenuItem disabled>
      <CircularProgress size={20} sx={{ mr: 1 }} /> Loading Zones...
    </MenuItem>
  ) : zoneError ? (
    <MenuItem disabled>
      <Alert severity="error" sx={{ py: 0, px: 1 }}>
        Zone Error
      </Alert>
    </MenuItem>
  ) : (
    zoneOptions.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* 2. Header Box: Title (Left) and Button (Right) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} component="h1">
          Department Complaint Registry
        </Typography>

        <Button
          variant={isPendingFilterActive ? "outlined" : "contained"}
          color={isPendingFilterActive ? "primary" : "success"}
          size={isMobile ? "medium" : "large"}
          onClick={handlePendingAssignmentToggle}
          sx={{ width: isMobile ? "100%" : "auto" }}
        >
          {isPendingFilterActive
            ? "Viewing Pending Assignments | Clear"
            : "View Pending Assignments"}
        </Button>
      </Box>

      {/* 3. Filter & Search Bar Section */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <TextField
          label="Search by (ID, Title, Email, Name, Description)"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flexGrow: 1,
            minWidth: "200px",
            width: isMobile ? "100%" : "auto",
          }}
        />

        <Select
          value={isPendingFilterActive ? "ALL" : filters.status}
          onChange={(e) => updateFilter("status", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150, width: isMobile ? "100%" : "auto" }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={filters.zoneId}
          onChange={(e) => updateFilter("zoneId", e.target.value)}
          displayEmpty
          size="small"
          disabled={zoneLoading || zoneError}
          sx={{ minWidth: 150, width: isMobile ? "100%" : "auto" }}
        >
          <MenuItem value="">All Zones</MenuItem>
          {zoneDropdownContent}
        </Select>

        <Select
          value={filters.sort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 180, width: isMobile ? "100%" : "auto" }}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <Typography
          variant="body1"
          sx={{
            ml: isMobile ? 0 : "auto",
            fontWeight: "bold",
            width: isMobile ? "100%" : "auto",
            textAlign: isMobile ? "center" : "right",
          }}
        >
          {totalResults} Total Complaints
        </Typography>
      </Paper>

      {/* 4. Complaints Table/Card Section */}
      <Paper>
        {renderContent()}
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            disabled={isLoading}
          />
        </Box>
      </Paper>

      {/* CONSOLIDATED ACTION MENU/POPOVER COMPONENT (MUI Menu) */}
      <Menu
        anchorEl={actionAnchorEl}
        open={openActionMenu}
        onClose={handleCloseActionMenu}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem onClick={handleAssignManually}>Assign Manually</MenuItem>
        <MenuItem onClick={handleAutoAssign} disabled={isAutoAssigning}>
          {isAutoAssigning ? "Auto-Assigning..." : "Auto-Assign"}
        </MenuItem>
      </Menu>

      {/* ASSIGNMENT MODAL */}
      <AssignmentModal
        open={assignmentModalOpen}
        handleClose={() => {
          setAssignmentModalOpen(false);
          setSelectedComplaintId(null);
        }}
        complaintId={selectedComplaintId}
        refetchComplaints={refetch}
      />

      {/* DETAIL MODAL  */}
      <ComplaintDetailModal
        open={detailModalOpen}
        handleClose={() => {
          setDetailModalOpen(false);
          setSelectedComplaintId(null);
        }}
        complaintId={selectedComplaintId}
      />
    </Box>
  );
};

export default ComplaintsPage;
