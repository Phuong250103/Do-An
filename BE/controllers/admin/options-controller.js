const Category = require("../../models/Category");
const Brand = require("../../models/Brand");
const Size = require("../../models/Size");
const Color = require("../../models/Color");

// Helper function để lấy model dựa trên type
const getModel = (type) => {
  const models = {
    category: Category,
    brand: Brand,
    size: Size,
    color: Color,
  };
  return models[type.toLowerCase()];
};

// Get all options by type
const getAllOptions = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getModel(type);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be category, brand, size, or color",
      });
    }

    const options = await Model.find({}).sort({ label: 1 });
    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Add new option
const addOption = async (req, res) => {
  try {
    const { type } = req.params;
    const { name, label, code } = req.body;

    const Model = getModel(type);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be category, brand, size, or color",
      });
    }

    if (!name || !label) {
      return res.status(400).json({
        success: false,
        message: "Name and label are required",
      });
    }

    // Only color requires code
    if (type === "color" && !code) {
      return res.status(400).json({
        success: false,
        message: "Code is required for color",
      });
    }

    // Check if option already exists
    const existingOption = await Model.findOne({ name });
    if (existingOption) {
      return res.status(400).json({
        success: false,
        message: `${type} with this name already exists`,
      });
    }

    const newOptionData = { name, label };
    if (type === "color") newOptionData.code = code;

    const newOption = new Model(newOptionData);

    await newOption.save();

    res.status(201).json({
      success: true,
      data: newOption,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Edit option
const editOption = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { name, label, code } = req.body;

    const Model = getModel(type);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be category, brand, size, or color",
      });
    }

    const option = await Model.findById(id);
    if (!option) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }

    // Check if new name already exists (excluding current option)
    if (name && name !== option.name) {
      const existingOption = await Model.findOne({ name });
      if (existingOption) {
        return res.status(400).json({
          success: false,
          message: `${type} with this name already exists`,
        });
      }
    }

    if (name) option.name = name;
    if (label) option.label = label;
    if (code) option.code = code;

    await option.save();

    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Delete option
const deleteOption = async (req, res) => {
  try {
    const { type, id } = req.params;

    const Model = getModel(type);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be category, brand, size, or color",
      });
    }

    const option = await Model.findByIdAndDelete(id);
    if (!option) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${type} deleted successfully`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  getAllOptions,
  addOption,
  editOption,
  deleteOption,
};
