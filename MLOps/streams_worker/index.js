import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

// Create Redis client using the PRIVATE Railway Redis URL
// Example: redis://default:password@redis:6379
const redis = new Redis(process.env.REDIS_URL);

// Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("ok");
});

// Events endpoint
app.post("/events", (req, res) => {
  // IMPORTANT:
  // Respond immediately so Railway does NOT timeout (prevents 502)
  res.json({ ok: true });

  // Write to Redis Streams asynchronously
  // Do NOT block the HTTP response
  redis
    .xadd(
      "events",        // stream name
      "*",             // auto-generated ID
      "payload",       // field name
      JSON.stringify(req.body) // event payload
    )
    .catch((err) => {
      // Log errors, but do not crash the process
      console.error("Redis XADD failed:", err);
    });
});

// Railway provides PORT via env var
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`streams_worker listening on ${PORT}`);
});