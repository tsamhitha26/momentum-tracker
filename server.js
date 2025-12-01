require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Route imports
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const syncRoutes = require("./routes/syncRoutes");

const app = express();

// Body parser
app.use(express.json({ limit: "10mb" }));

// CORS — allow local dev + deployed frontend
app.use(cors({
  origin: [
    "http://localhost:5173",                   // local dev
    //"https://YOUR_NETLIFY_URL.netlify.app"    // frontend deploy (update later)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("MongoDB connection error:", e));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sync", syncRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
