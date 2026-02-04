import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

app.post("/events", async (req, res) => {
  const event = req.body;

  await redis.xadd(
    "events",
    "*",
    "payload",
    JSON.stringify(event)
  );

  res.send({ ok: true });
});

app.listen(3000, () => {
  console.log("streams_worker listening on 3000");
});