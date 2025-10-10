const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");
const cityAdminController = require("../controllers/cityAdminController");

router.get(
  "/me",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getCityAdminProfile
);

router.get(
  "/departments",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getAllDepartmentsForCityAdmin
);

router.get(
  "/:departmentId/zones",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getZonesByDepartment
);

router.get(
  "/:departmentId/complaints/:zoneId",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getComplaintsByDepartmentZone
);

router.get(
  "/:departmentId/complaints",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getAllComplaintsByDepartment
);

router.get(
  "/:departmentId",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.getDepartmentAdminByDepartmentId
);

router.post(
  "/:departmentId/createDeptAdmin",
  authenticate,
  roleCheck(["city_admin"]),
  upload.single("photo"),
  cityAdminController.createDepartmentAdmin
);

router.patch(
  "/updateDeptAdmin/:firebaseUid",
  authenticate,
  roleCheck(["city_admin"]),
  upload.single("photo"),
  cityAdminController.updateDepartmentAdmin
);

router.delete(
  "/deleteDeptAdmin/:firebaseUid",
  authenticate,
  roleCheck(["city_admin"]),
  cityAdminController.deleteDepartmentAdmin
);

module.exports = router;
