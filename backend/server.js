
console.log("🔥 THIS IS MY SERVER FILE");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./database/db");
// Routes
const authRoutes = require("./routes/authRoutes");

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/hello", (req, res) => {
  res.send("HELLO ROUTE WORKING");
});

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 Dayflow Backend Running");
});
console.log("✅ Auth Routes Loaded");
// API Routes

app.use("/api/auth", (req, res, next) => {
  console.log("🔥 API AUTH HIT:", req.method, req.url);
  next();
});
app.use("/api/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
}); 
app.use("/api/auth", (req, res, next) => {
  console.log("🔥 /api/auth middleware reached");
  next();
});

app.use("/api/auth", authRoutes);