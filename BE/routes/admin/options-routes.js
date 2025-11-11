const express = require("express");
const router = express.Router();
const {
  getAllOptions,
  addOption,
  editOption,
  deleteOption,
} = require("../../controllers/admin/options-controller");

// Get all options by type (category, brand, size, color)
router.get("/:type", getAllOptions);

// Add new option
router.post("/:type", addOption);

// Edit option
router.put("/:type/:id", editOption);

// Delete option
router.delete("/:type/:id", deleteOption);

module.exports = router;

