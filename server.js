const express = require("express");
const app = express();
const { connectToMongo } = require("./connect_mongo");
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/create_user", async (req, res) => {
  const db = await connectToMongo();
  const collection = db.collection("users");
  await collection.insertOne({
    _id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    role: "user",
  });
  res.json({ message: "user created" });
});

app.get("/user/:id", async (req, res) => {
  const db = await connectToMongo();
  const collection = db.collection("users");
  const user = await collection.findOne({ _id: req.params.id });
  res.json(user);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(port, async () => {
  await connectToMongo();
  console.log(`Example app listening on port ${port}`);
});
