import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory request tracker
let requestTracker = {};

// Rate Limiter Middleware
const rateLimiter = (req, res, next) => {
  const maxRequests = 5;
  const windowTime = 5 * 60 * 1000; // 5 minutes

  const ip = req.ip;
  const currentTime = Date.now();

  if (!requestTracker[ip]) {
    requestTracker[ip] = {
      count: 1,
      startTime: currentTime,
    };
    return next();
  }

  const user = requestTracker[ip];

  // Same time window
  if (currentTime - user.startTime < windowTime) {
    if (user.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    user.count++;
    return next();
  }

  // Reset window
  requestTracker[ip] = {
    count: 1,
    startTime: currentTime,
  };

  next();
};

// Apply middleware globally
app.use(rateLimiter);
// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Node.js Rate Limiter API",
  });
});

// Users Route
app.get("/api/v1/users", (req, res) => {
  res.json({
    success: true,
    users: [
      {
        id: 1,
        name: "John",
      },
      {
        id: 2,
        name: "Alice",
      },
    ],
  });
});

app.get("/api/v1/usersids", (req, res) => {
  res.json({
    success: true,
    users: [
      {
        id: 1,
        name: "gulluer",
      },
      {
        id: 2,
        name: "goluy788999",
      },
    ],
  });
});

// Create User
app.post("/api/v1/users", (req, res) => {
  const { name, email } = req.body;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      name,
      email,
    },
  });
});

// Start Server
const PORT = 6001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
