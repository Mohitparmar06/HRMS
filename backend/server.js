const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const bcrypt = require("bcrypt");

const connectDB = require("./database/db");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const userSettingsRoutes = require("./routes/userSettingsRoutes");
const demoRequestRoutes = require("./routes/demoRequestRoutes");

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "HRMS Backend Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payrolls", payrollRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/demo-requests", demoRequestRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "Admin" });
    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin123";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        fullName: "System Admin",
        email: (process.env.ADMIN_EMAIL || "admin@dayflow.com").toLowerCase(),
        password: hashedPassword,
        role: "Admin",
        department: "Administration",
        designation: "System Administrator",
        firstLogin: false,
        status: "Active",
      });

      console.log("Default admin user created:");
      console.log(`  Email: ${process.env.ADMIN_EMAIL || "admin@dayflow.com"}`);
      console.log(`  Password: ${process.env.ADMIN_PASSWORD || "Admin123"}`);
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
}

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
