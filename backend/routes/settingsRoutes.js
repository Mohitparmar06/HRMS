const express = require("express");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

const {
  getAllSettings,
  getSection,
  updateSection,
  changePassword,
  backupData,
  restoreData,
  resetData,
} = require("../controllers/settingsController");

router.use(protect);

router.get("/", getAllSettings);
router.get("/:section", getSection);
router.put("/:section", updateSection);
router.post("/change-password", changePassword);
router.post("/backup", backupData);
router.post("/restore", restoreData);
router.post("/reset", resetData);

module.exports = router;
