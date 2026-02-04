import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

// Redis client (Railway internal)
const redis = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false
});

// REQUIRED: prevent crashes from Redis errors
redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

// Health check
app.get("/", (req, res) => {
  res.send("ok");
});

// Event ingestion
app.post("/events", (req, res) => {
  // Respond immediately to avoid Railway timeout
  res.json({ ok: true });

  // Fire-and-forget stream write
  redis.xadd(
    "events",
    "*",
    "payload",
    JSON.stringify(req.body)
  ).catch(err => {
    console.error("XADD failed:", err.message);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`streams_worker listening on ${PORT}`);
});
