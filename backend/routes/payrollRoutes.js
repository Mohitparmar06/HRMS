const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createPayroll,
  getPayrolls,
  getPayrollsByEmployee,
  getPayrollById,
  updatePayroll,
  deletePayroll,
} = require("../controllers/payrollController");

router.use(protect);

router.post("/", createPayroll);
router.get("/", getPayrolls);
router.get("/employee/:employeeId", getPayrollsByEmployee);
router.get("/:id", getPayrollById);
router.put("/:id", updatePayroll);
router.delete("/:id", deletePayroll);

module.exports = router;
