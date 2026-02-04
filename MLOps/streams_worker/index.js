import express from "express";
import Redis from "ioredis";

// CRASH GUARDS (Railway 502 fix)
process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

const app = express();
app.use(express.json());

// Redis client (internal Railway)
const redis = new Redis(process.env.REDIS_URL, {
  enableOfflineQueue: false,
});

// REQUIRED: swallow Redis errors so process does NOT exit
redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

// Health
app.get("/", (_req, res) => res.send("ok"));

// Ingest
app.post("/events", (req, res) => {
  // Respond immediately so Railway never 502s
  res.json({ ok: true });

  // Fire-and-forget stream write
  redis
    .xadd("events", "*", "payload", JSON.stringify(req.body))
    .catch((err) => {
      console.error("XADD failed:", err.message);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`streams_worker listening on ${PORT}`);
});
