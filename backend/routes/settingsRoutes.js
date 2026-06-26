const express = require("express");
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

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getAllSettings);
router.get("/:section", getSection);
router.put("/:section", adminOnly, updateSection);
router.post("/change-password", changePassword);
router.post("/backup", adminOnly, backupData);
router.post("/restore", adminOnly, restoreData);
router.post("/reset", adminOnly, resetData);

module.exports = router;
