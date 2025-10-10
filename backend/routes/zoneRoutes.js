const express = require("express");
const router = express.Router();
const {
  authenticate,
  roleCheck,
} = require("../middlewares/firebaseAuthRoleMiddleware");
const zoneController = require("../controllers/zoneController");

router.get(
  "/:departmentId",
  authenticate,
  roleCheck(["city_admin", "dept_admin"]),
  zoneController.getZones
);
router.post(
  "/",
  authenticate,
  roleCheck(["city_admin"]),
  zoneController.createZone
);
router.patch(
  "/:id",
  authenticate,
  roleCheck(["city_admin"]),
  zoneController.updateZone
);
router.delete(
  "/:id",
  authenticate,
  roleCheck(["city_admin"]),
  zoneController.deleteZone
);

module.exports = router;
