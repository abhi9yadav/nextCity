const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zoneController");

router.get("/:cityId/:departmentId", zoneController.getZones);
router.post("/", zoneController.createZone);
router.patch("/:id", zoneController.updateZone);
router.delete("/:id", zoneController.deleteZone);

module.exports = router;
