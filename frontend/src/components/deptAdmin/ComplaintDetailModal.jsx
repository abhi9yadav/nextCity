import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import { fetchComplaintDetails } from "../../api/deptAdminService";

const renderStatusBadge = (status) => {
  let color = "default";
  if (status === "OPEN") color = "error";
  if (status === "IN_PROGRESS") color = "warning";
  if (status === "RESOLVED") color = "success";
  if (status === "REOPENED") color = "info";
  if (status === "CLOSED") color = "primary";

  return (
    <Chip
      label={status.replace("_", " ")}
      color={color}
      size="small"
      sx={{ fontWeight: "bold" }}
    />
  );
};

const modalStyle = (isMobile) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: isMobile ? "95%" : 800,
  maxWidth: 900,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
});

const ComplaintDetailModal = ({ open, handleClose, complaintId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const modalMounted = useRef(true);

  const fetchDetails = useCallback(async () => {
    if (!complaintId) return;
    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const response = await fetchComplaintDetails(complaintId);
      if (modalMounted.current) setComplaint(response.data.complaint);
    } catch (err) {
      if (modalMounted.current)
        setError(
          err.response?.data?.message || "Failed to load complaint details."
        );
    } finally {
      if (modalMounted.current) setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    modalMounted.current = true;
    if (open) fetchDetails();
    return () => (modalMounted.current = false);
  }, [open, fetchDetails]);

  const renderHistory = (history) => {
    if (!history || history.length === 0)
      return (
        <Typography variant="body2" color="text.secondary">
          No history recorded.
        </Typography>
      );

    return (
      <Card
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          p: 1,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <CardContent>
          <List dense disablePadding>
            {history.map((item, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 0.5,
                  borderLeft: "3px solid",
                  borderColor: "grey.300",
                  pl: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="bold">
                      {item.action.replace("_", " ").toUpperCase()}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ display: "block" }}
                      >
                        {new Date(item.timeStamp).toLocaleString()} by:{" "}
                        {item.by?.name || "Unknown User"}
                      </Typography>
                      {item.note && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.primary"
                        >
                          Note: {item.note}
                        </Typography>
                      )}
                      {item.from && item.to && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.primary"
                          sx={{ display: "block" }}
                        >
                          Status: {item.from} → {item.to}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="complaint-detail-title"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "95%" : 900,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 3,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        component={Paper}
      >
        {/* --- Top Fixed Section --- */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography id="complaint-detail-title" variant="h5" gutterBottom>
            Complaint Details: {complaintId?.slice(-6) || "..."}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : complaint ? (
            <Grid container spacing={isMobile ? 2 : 4}>
              {/* Right Complaint Info */}
              <Grid container spacing={2}>
                <Grid sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    TITLE
                  </Typography>
                  <Typography variant="body1">{complaint.title}</Typography>
                </Grid>
                <Grid xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    CURRENT STATUS
                  </Typography>
                  {renderStatusBadge(complaint.status)}
                </Grid>
                <Grid xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ mb: 0.5 }}
                  >
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {complaint.description}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    FILED BY
                  </Typography>
                  <Typography variant="body1">
                    {complaint.createdBy?.name || "Citizen N/A"}
                  </Typography>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    LOCATION / ZONE
                  </Typography>
                  <Typography variant="body1">
                    {complaint.location?.address || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Zone: {complaint.zone_id?.zone_name || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No complaint data loaded.</Alert>
          )}
        </Box>

        {/* --- Scrollable History Section --- */}
        <Box
          sx={{
            mt: 3,
            flexGrow: 1,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            overflow: "hidden",
            gap: 2,
          }}
        >
          {/* Left Column: Media & Attachments */}
          <Box
            sx={{
              flex: { xs: "unset", sm: "0 0 30%" },
              minWidth: { xs: "100%", sm: 250 },
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Media & Attachments
            </Typography>
            {!complaint?.attachments || complaint.attachments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No media attached.
              </Typography>
            ) : (
              <Grid container spacing={1}>
                {complaint.attachments.map((att, i) => (
                  <Grid key={i} sx={{ gridColumn: "span 4", mb: 1 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "grey.200",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "grey.300",
                      }}
                    >
                      <Typography variant="caption">
                        {att.type.toUpperCase()}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Right Column: Complaint History */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              maxHeight: "100%",
              borderLeft: { sm: "1px solid", xs: "none" },
              borderColor: "grey.300",
            }}
          >
            {/* Fixed Header */}
            <Box
              sx={{
                flexShrink: 0,
                p: 1,
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "grey.300",
              }}
            >
              <Typography variant="h6">Complaint History</Typography>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
              {complaint && renderHistory(complaint.history)}
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ComplaintDetailModal;
