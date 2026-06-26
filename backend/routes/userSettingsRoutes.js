const express = require("express");
const router = express.Router();

const {
  getUserPreferences,
  updateUserPreferences,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userSettingsController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/me/preferences", getUserPreferences);
router.put("/me/preferences", updateUserPreferences);
router.get("/me/profile", getUserProfile);
router.put("/me/profile", updateUserProfile);

module.exports = router;
