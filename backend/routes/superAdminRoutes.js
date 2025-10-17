const express = require("express");
const router = express.Router();
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");
const superAdminController = require("../controllers/superAdminController");
const invitationController = require("../controllers/invitationController");
const upload = require("../middlewares/uploadMiddleware");

// Create a new City
router.post(
  "/cities",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.createCity
);

// Create a new Department
router.post(
  "/departments",
  authenticate,
  roleCheck(["super_admin"]),
  upload.single("photo"),
  superAdminController.createDepartment
);

// Fetch all cities
router.get(
  "/cities",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.getAllCities
);

router.delete(
  "/city/:cityId",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.deleteCity
);

// Fetch all departments
router.get(
  "/departments",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.getAllDepartments
);

// Update a Department
router.patch(
  "/departments/:departmentId",
  authenticate,
  roleCheck(["super_admin"]),
  upload.single("photo"),
  superAdminController.updateDepartment
);

// Delete a Department
router.delete(
  "/departments/:departmentId",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.deleteDepartment
);

// Fetch all City Admins
router.get(
  "/cityAdmins",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.getAllCityAdmins
);

router.get(
  "/cityAdmin/:cityAdminId",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.getOneCityAdmin
);

router.post(
  "/users/create",
  authenticate,
  roleCheck(["super_admin"]),
  upload.single("photo"),
  superAdminController.createUser
);

router.delete(
  "/users/:firebaseUid",
  authenticate,
  roleCheck(["super_admin"]),
  superAdminController.deleteUser
);

router.patch(
  "/users/:firebaseUid",
  authenticate,
  roleCheck(["super_admin"]),
  upload.single("photo"),
  superAdminController.updateUser
);

router.post(
  "/users/:firebaseUid/resend-invitation",
  authenticate,
  roleCheck(["super_admin"]),
  invitationController.resendInvitation
);

module.exports = router;
