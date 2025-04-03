require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config");
const fileRoutes = require("./routes/fileRoutes");
const path = require("path");
const fs = require("fs");

const app = express();

// Load environment variables
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = process.env.UPLOADS_DIR || "uploads";

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, UPLOADS_DIR);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// CORS Configuration
const allowedOrigins = [
  "https://shareeasy-frontend.onrender.com",
  "http://localhost:3000" // For local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Connect to MongoDB
connectDB();

// Root Route for Debugging
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Backend is running!",
    availableRoutes: [
      { method: "GET", path: "/api/home" },
      { method: "POST", path: "/api/upload" },
      { method: "GET", path: "/files/:filename" },
    ],
    environment: process.env.NODE_ENV || "development"
  });
});

// Serve static files from the uploads directory
app.use("/files", express.static(uploadsPath));

// File routes
app.use("/api", fileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "Cross-origin request blocked",
      allowedOrigins: allowedOrigins
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      { method: "GET", path: "/" },
      { method: "POST", path: "/api/upload" },
      { method: "GET", path: "/files/:filename" }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Static files served from ${uploadsPath}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`📌 Available routes:`);
  console.log(`- GET /`);
  console.log(`- POST /api/upload`);
  console.log(`- GET /files/:filename`);
});
