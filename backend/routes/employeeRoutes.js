const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);

router.post("/", adminOnly, createEmployee);
router.put("/:id", adminOnly, updateEmployee);
router.delete("/:id", adminOnly, deleteEmployee);

module.exports = router;
