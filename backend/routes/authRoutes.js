const protect = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working"
  });
});

router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected Route Working",
    user: req.user,
  });
}); 

module.exports = router;