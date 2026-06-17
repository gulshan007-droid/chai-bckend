import express from "express";
import { connection } from "./db/db.js";

import dotenv from "dotenv";

dotenv.config();

const app = express();

connection();

let requestTracker = {};

const rateLimiter = (req, res, next) => {
  const max = 5;
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

  console.log("currentTime:", currentTime);
  console.log("startTime:", user.startTime);

  if (currentTime - user.startTime < windowTime) {
    if (user.count >= max) {
      return res.status(429).json({
        message: "Too many requests",
      });
    }

    user.count++;
    return next();
  }

  requestTracker[ip] = {
    count: 1,
    startTime: currentTime,
  };

  next();
};

app.use(rateLimiter);

// ¸

// (async () => {
//   try {
//     await mongoose.connect(
//       `${process.env.Mongo_uri}/${DB_NAME}`
//     );

//     console.log("MongoDB Connected");

//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on port ${process.env.PORT}`);
//     });

//   } catch (err) {
//     console.error("Database Connection Error:", err);
//     process.exit(1);
//   }
// })();

app.get("/app", (req, res) => {
  res.send("app is working");
});

app.listen(6001, () => {
  console.log("Server running on port 6001");
});
