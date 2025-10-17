import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Divider,
  Alert,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AssignmentIcon from "@mui/icons-material/Assignment";

const KPIStats = ({ stats }) => {
  const kpiData = [
    {
      title: "Total Assigned",
      value: stats.totalAssigned || 0,
      icon: AssignmentIcon,
      color: "#1976d2",
    },
    {
      title: "Resolved",
      value: stats.resolved || 0,
      icon: CheckCircleOutlineIcon,
      color: "#2e7d32",
    },
    {
      title: "In Progress",
      value: stats.inProgress || 0,
      icon: AutorenewIcon,
      color: "#ed6c02",
    },
    {
      title: "Resolution Rate",
      value:
        ((stats.resolved / Math.max(stats.totalAssigned, 1)) * 100).toFixed(1) +
        "%",
      icon: AutorenewIcon,
      color: "#0288d1",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: "1.5rem",
      }}
    >
      {kpiData.map((item) => (
        <div
          key={item.title}
          style={{
            flex: "1 1 calc(25% - 1.5rem)",
            minWidth: "220px",
            display: "flex",
          }}
        >
          <Card
            style={{
              flex: 1,
              textAlign: "center",
              padding: "1.5rem 1rem",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              borderLeft: `6px solid ${item.color}`,
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <item.icon
              style={{
                fontSize: 40,
                color: item.color,
                marginBottom: "8px",
              }}
            />
            <Typography
              variant="subtitle2"
              style={{
                color: "#6b7280",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="h5"
              style={{
                color: item.color,
                fontWeight: 700,
                marginTop: "4px",
              }}
            >
              {item.value}
            </Typography>
          </Card>
        </div>
      ))}
    </div>
  );
};

import { fetchWorkerDetails } from "../../api/deptAdminService";
import ComplaintDetailModal from "./ComplaintDetailModal";

const WorkerDetailPage = ({ workerId }) => {
  const [worker, setWorker] = useState(null);
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (id) => {
    setSelectedComplaintId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedComplaintId(null);
  };

  useEffect(() => {
    const loadWorkerData = async () => {
      try {
        const res = await fetchWorkerDetails(workerId);
        setWorker(res.data.worker);
        setStats(res.data.stats);
        setComplaints(res.data.complaints);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load worker data.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkerData();
  }, [workerId]);

  const getStatusChipProps = (status) => {
    switch (status) {
      case "RESOLVED":
      case "IN_PROGRESS":
        return {
          label: status.replace("_", " "),
          color: "warning",
          variant: "outlined",
        };
      default:
        return {
          label: status.replace("_", " "),
          color: "default",
          variant: "outlined",
        };
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: "auto",
        bgcolor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* Header and Back Button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none",
            borderRadius: 8,
            boxShadow: 3,
            fontWeight: "bold",
            mr: 3,
          }}
        >
          Back to List
        </Button>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Worker Performance Dashboard
        </Typography>
      </Box>

      {/* Worker Info Card */}
      <Card sx={{ mb: 4, boxShadow: 6, borderRadius: 3, bgcolor: "white" }}>
        <CardContent>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {worker.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {worker.email}
              </Typography>
              <Chip
                label={`Joined: ${new Date(
                  worker.createdAt
                ).toLocaleDateString()}`}
                size="small"
                sx={{ bgcolor: "#e0f7fa", color: "#006064", fontWeight: 500 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Department:
              </Typography>
              <Typography fontWeight={500} color="primary.main">
                {worker.department_id?.department_name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                Assigned Zone:
              </Typography>
              <Typography fontWeight={500}>
                {worker.zone_id?.zone_name || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Performance Indicators (KPIs) */}

      <KPIStats stats={stats} />

      {/* Complaints Table Section */}
      <Typography
        variant="h5"
        fontWeight={600}
        gutterBottom
        sx={{ mt: 4, color: "text.primary" }}
      >
        Current & Recent Assignments
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Card sx={{ boxShadow: 4, borderRadius: 3, overflowX: "auto" }}>
        {complaints.length === 0 ? (
          <CardContent>
            <Typography color="text.secondary" textAlign="center" py={4}>
              No complaints currently assigned to this worker.
            </Typography>
          </CardContent>
        ) : (
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "#eceff1" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Complaint Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Filed By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date Assigned</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((c, index) => {
                const chipProps = getStatusChipProps(c.status);
                if (c.status === "IN_PROGRESS" || c.status === "REOPENED") {
                  return (
                    <TableRow
                      key={c._id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                        "&:hover": { backgroundColor: "#f0f4f7" },
                      }}
                    >
                      <TableCell
                        sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                      >
                        {c._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>
                        <Chip
                          {...chipProps}
                          size="small"
                          sx={{
                            minWidth: 100,
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {c.createdBy?.name || "Anonymous User"}
                      </TableCell>
                      <TableCell>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(c._id)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <ComplaintDetailModal
        open={modalOpen}
        handleClose={handleCloseModal}
        complaintId={selectedComplaintId}
      />
    </Box>
  );
};

export default WorkerDetailPage;
