const Zone = require("../models/zoneModel");

// ✅ Get all zones for a department of a city
exports.getZones = async (req, res) => {
  try {
    const { cityId, departmentId } = req.params;
    const zones = await Zone.find({ city_id: cityId, department_id: departmentId });
    res.status(200).json({ success: true, zones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch zones" });
  }
};

// ✅ Create new zone
exports.createZone = async (req, res) => {
  try {
    const { zone_name, city_id, department_id, geographical_boundary, color, description } = req.body;
    // console.log("req.body:", req.body);
    // const created_by = req.user._id;
    const created_by = "68e2cac3c2835789130bfff5";

    const zone = await Zone.create({
      zone_name,
      city_id,
      department_id,
      geographical_boundary,
      color,
      description,
      created_by
    });

    res.status(201).json({ success: true, zone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Zone creation failed" });
  }
};

// ✅ Update zone
exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const zone = await Zone.findByIdAndUpdate(id, updates, { new: true });
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });

    res.status(200).json({ success: true, zone });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// ✅ Delete zone
exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Zone.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Zone not found" });

    res.status(200).json({ success: true, message: "Zone deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
