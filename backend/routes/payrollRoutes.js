const express = require("express");

const router = express.Router();

const {
  createPayroll,
  getPayrolls,
  getPayrollById,
  deletePayroll,
} = require("../controllers/payrollController");

router.post("/", createPayroll);

router.get("/", getPayrolls);

router.get("/:id", getPayrollById);

router.delete("/:id", deletePayroll);

module.exports = router;