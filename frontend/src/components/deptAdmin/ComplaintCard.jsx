import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";

const ComplaintCard = ({
  complaint,
  renderStatusBadge,
  handleOpenActionMenu,
  handleViewDetails,
  isAutoAssigning,
}) => {
  const isAssignable =
    complaint.status === "OPEN" || complaint.status === "REOPENED";
  const [cardActionAnchorEl, setCardActionAnchorEl] = React.useState(null);
  const openCardActionMenu = Boolean(cardActionAnchorEl);

  const handleCardMenuOpen = (event) => {
    setCardActionAnchorEl(event.currentTarget);
  };

  const handleCardMenuClose = () => {
    setCardActionAnchorEl(null);
  };

  const handleAssignClick = (event) => {
    handleCardMenuClose();
    handleOpenActionMenu(event, complaint._id);
  };

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.primary"
          >
            {complaint._id.slice(-4)} / {complaint.title}
          </Typography>
          {renderStatusBadge(complaint.status)}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Zone: {complaint.zoneName || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Votes: {complaint.votesCount}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Assigned To: {complaint.assignedTo?.name || "Unassigned"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Date Filed: {new Date(complaint.createdAt).toLocaleDateString()}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          {isAssignable && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={handleAssignClick}
              >
                ASSIGN
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDetails(complaint._id)}
            startIcon={
              <span role="img" aria-label="details">
                👁️
              </span>
            }
          >
            Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ComplaintCard;
