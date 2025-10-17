const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zoneController");
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");
const deptAdminController = require("../controllers/deptAdminController");

// ---------- Dashboard & Stats ----------
router.get(
  "/dashboard/stats",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getDashboardStats
);

// ---------- Workers Management ----------
router.post(
  "/workers/create",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.createWorker
);

router.get(
  "/workers/:firebaseUid",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getWorker
);

router.get(
  "/workers",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getWorkers
);

// routes/deptAdminRoutes.js
router.get(
  "/worker/:workerId/details",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getWorkerDetails
);


router.patch(
  "/workers/:workerId",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.updateWorker
);

router.delete(
  "/workers/:workerId",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.deleteWorker
);

router.post(
  "/workers/:workerId/resend-invitation",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.resendWorkerInvitation
);

router.get(
  "/zones",
  authenticate,
  roleCheck(["dept_admin"]),
  zoneController.getZones
);

// ---------- Complaints Management ----------
router.get(
  "/complaints",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getComplaints
);

router.get(
  "/complaints/:complaintId/details",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getComplaintDetails
)

router.get(
  "/complaints/:complaintId/candidates",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.getCandidateWorkers
);

router.post(
  "/complaints/:complaintId/assign",
  authenticate,
  roleCheck(["dept_admin"]),
  deptAdminController.assignComplaintToWorker
);

module.exports = router;
