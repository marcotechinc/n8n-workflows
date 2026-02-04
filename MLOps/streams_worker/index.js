import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/events", async (req, res) => {
  try {
    await redis.xadd(
      "events",
      "*",
      "payload",
      JSON.stringify(req.body)
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`streams_worker listening on ${PORT}`);
});