const express = require("express");
const router = express.Router();

const {
  createPayroll,
  getPayrolls,
  getPayrollsByEmployee,
  getPayrollById,
  updatePayroll,
  deletePayroll,
} = require("../controllers/payrollController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", adminOnly, createPayroll);
router.get("/", getPayrolls);
router.get("/employee/:employeeId", getPayrollsByEmployee);
router.get("/:id", getPayrollById);
router.put("/:id", adminOnly, updatePayroll);
router.delete("/:id", adminOnly, deletePayroll);

module.exports = router;
