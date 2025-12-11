const express = require("express");
const { getUserById } = require("../../controllers/admin/users-controller");

const router = express.Router();

router.get("/get/:id", getUserById);

module.exports = router;
