import express from "express";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("ok");
});

app.post("/events", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`streams_worker listening on ${PORT}`);
});