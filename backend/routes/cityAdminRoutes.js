const express = require("express");
const router = express.Router();
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");
const cityAdminController = require("../controllers/cityAdminController");

router.get(
  "/:departmentId/complaints/:zoneId",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getComplaintsByDepartmentZone
);

router.get(
  ":departmentId",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getDepartmentAdminByDepartmentId
);

router.post(
  "/:departmentId/createDeptAdmin",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.createDepartmentAdmin
);

router.patch(
  "/updateDeptAdmin/:firebaseUid",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.updateDepartmentAdmin
);

router.delete(
  "/deleteDeptAdmin/:firebaseUid",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.deleteDepartmentAdmin
);

module.exports = router;
