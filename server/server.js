const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const cityRoutes = require("./routes/cityRoutes");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./connections/mongoDB");

// Load environment variables
dotenv.config();

// Check required environment variable
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

// Create Express app
const app = express();

// IMPORTANT: cookieParser must come BEFORE other middleware
app.use(cookieParser());

// CORS configuration - VERY IMPORTANT for cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // This is crucial for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cities", cityRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 9000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
