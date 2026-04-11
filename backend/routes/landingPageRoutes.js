const express = require("express");
const router = express.Router();
const cityAdminController = require("../controllers/cityAdminController");

router.get("/departments", cityAdminController.getAllDepartmentsForCityAdmin);

module.exports = router;
