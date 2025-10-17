import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material";

import {
  fetchCandidateWorkers,
  assignComplaintToWorker,
} from "../../api/deptAdminService";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

const AssignmentModal = ({
  open,
  handleClose,
  complaintId,
  refetchComplaints,
}) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  const modalMounted = useRef(true);

  const fetchCandidates = useCallback(async () => {
    if (!complaintId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCandidateWorkers(complaintId);
      if (modalMounted.current) {
        setCandidates(response.data.candidates || []);
      }
    } catch (err) {
      if (modalMounted.current) {
        console.error("Failed to fetch candidates:", err);
        setError(
          err.response?.data?.message || "Failed to load candidate workers."
        );
        setCandidates([]);
      }
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    modalMounted.current = true;

    if (open) {
      setCandidates([]);
      setSelectedWorkerId(null);
      fetchCandidates();
    }

    return () => {
      modalMounted.current = false;
      setLoading(false);
    };
  }, [open, complaintId, fetchCandidates]);

  const handleAssignWorker = async () => {
    if (!selectedWorkerId || isAssigning) return;

    setIsAssigning(true);
    setError(null);
    try {
      const res = await assignComplaintToWorker(complaintId, selectedWorkerId);
      const message = res.data.message;
      handleClose();
      refetchComplaints();
      toast.success(message);
    } catch (err) {
      console.error("Assignment failed:", err);
      setError(err.response?.data?.message || "Failed to assign complaint.");
    } finally {
      setIsAssigning(false);
    }
  };

  const renderCandidateItem = (worker) => (
    <ListItem
      key={worker._id}
      secondaryAction={
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
          }}
        >
          <Button
            variant={selectedWorkerId === worker._id ? "contained" : "outlined"}
            color="primary"
            onClick={() => setSelectedWorkerId(worker._id)}
            disabled={isAssigning}
            size="small"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {selectedWorkerId === worker._id ? "Selected" : "Select"}
          </Button>
        </Box>
      }
      sx={{
        cursor: "pointer",
        bgcolor:
          selectedWorkerId === worker._id ? "action.hover" : "background.paper",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        py: { xs: 2, sm: 1 },
      }}
    >
      <ListItemText
        primary={
          <Typography variant="subtitle1" fontWeight="bold">
            {worker.name}
          </Typography>
        }
        secondaryTypographyProps={{ component: "div" }}
        secondary={
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              mt: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ mr: { xs: 0, sm: 1 } }}
            >
              Rating: {worker.rating?.toFixed(1) || "N/A"}⭐
            </Typography>
            <Typography component="span" variant="body2" color="text.secondary">
              Assigned Count: {worker.assignedCount || 0}
            </Typography>
          </Box>
        }
        sx={{ mb: { xs: 1, sm: 0 } }}
      />
    </ListItem>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="assignment-modal-title"
    >
      <Box sx={modalStyle} component={Paper}>
        <Typography
          id="assignment-modal-title"
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
          Manual Assignment for Complaint ID:{" "}
          {complaintId ? complaintId.slice(-6) : "..."}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : candidates.length === 0 ? (
          <Alert severity="warning">
            No available or eligible workers found in the zone.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select a worker based on their current load (lowest first) and
              rating.
            </Typography>
            <List dense>{candidates.map(renderCandidateItem)}</List>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 3,
            gap: 1,
            flexDirection: { xs: "column-reverse", sm: "row" },
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isAssigning}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignWorker}
            variant="contained"
            color="primary"
            disabled={!selectedWorkerId || loading || isAssigning}
            startIcon={
              isAssigning && <CircularProgress size={20} color="inherit" />
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isAssigning ? "Assigning..." : "Assign Worker"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AssignmentModal;
