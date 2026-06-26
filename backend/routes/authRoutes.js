const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  changePassword,
  forceChangePassword,
  adminResetPassword,
  adminGetTempPassword,
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});

router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, getMe);

router.post("/change-password", protect, changePassword);
router.post("/force-change-password", protect, forceChangePassword);

router.post("/admin/reset-password", protect, adminOnly, adminResetPassword);
router.post("/admin/temp-password", protect, adminOnly, adminGetTempPassword);

module.exports = router;
