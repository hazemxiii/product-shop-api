require("dotenv").config();
const express = require("express");
const app = express();
const { verifyToken } = require("./config/firebase_helper");
const { connectToMongo } = require("./config/connect_mongo");
const cors = require("cors");
// const { AutoEncryptionLoggerLevel } = require("mongodb");
function isCreateUserValid(body) {
  return body.id && body.name && body.email;
}

function isUpdateUserValid(body) {
  const allowed = ["name", "email"];

  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) {
      return false;
    }
  }
  return true;
}
app.use(express.json());

/*
for deployment
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
*/

/* for development purposes */
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/user", async (req, res) => {
  const db = await connectToMongo();
  const collection = db.collection("users");
  const isValid = !!req.body && isCreateUserValid(req.body);
  if (!isValid) {
    res.statusCode = 400;
    return res.send({ message: "Enter Valid Body Data" });
  }

  const user = await collection.findOne({ _id: req.body.id });
  if (user) {
    res.statusCode = 400;
    return res.json({ message: "user already exists" });
  }
  await collection.insertOne({
    _id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    role: "user",
  });
  return res.json({ message: "user created" });
});

app.get("/user/:id", async (req, res) => {
  const db = await connectToMongo();
  const collection = db.collection("users");
  const user = await collection.findOne({ _id: req.params.id });
  res.json({ message: "success", user });
});

app.put("/user/:id", async (req, res) => {
  const db = await connectToMongo();
  const collection = db.collection("users");

  const isValid = isUpdateUserValid(req.body);
  console.log({ isValid });

  if (!req.body || !isUpdateUserValid(req.body)) {
    res.statusCode = 400;
    res.json({ message: "update data is invalid" });
  }

  const user = await collection.updateOne(
    { _id: req.params.id },
    { $set: req.body },
  );
  res.json({ message: "user updated" });
});

app.delete("/user/:id", async (req, res) => {
  const db = await connectToMongo();
  const collection = db.collection("users");
  const user = await collection.deleteOne({ _id: req.params.id });
  res.json({ message: "user deleted", user });
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
  // initFirebase();
  console.log(`Example app listening on port ${port}`);
});
