require("dotenv").config();
const express = require("express");
const app = express();
const { verifyToken } = require("./config/firebase_helper");
const { connectToMongo } = require("./config/connect_mongo");
const cors = require("cors");
let db;
// const { AutoEncryptionLoggerLevel } = require("mongodb");
function isCreateUserValid(body) {
  return (
    body.id &&
    body.name &&
    body.email &&
    (body.role === "user" || body.role === "seller")
  );
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
  const collection = db.collection("users");
  const isValid = !!req.body && isCreateUserValid(req.body);
  if (!isValid) {
    res.statusCode = 400;
    return res.send({ message: "Enter Valid Body Data" });
  }

  const user = await collection.findOne({ _id: req.body.id });
  if (user) {
    // res.statusCode = 400;
    // return res.json({ message: "user already exists" });
    return res.json({ message: "user already exists", user });
  }
  await collection.insertOne({
    _id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  });
  return res.json({ message: "user created" });
});

app.get("/user/:id", async (req, res) => {
  const user = await getUser(req.params.id);
  res.json({ message: "success", user });
});

async function getUser(id) {
  const collection = db.collection("users");
  const user = await collection.findOne({ _id: id });
  return user;
}

app.put("/user/:id", async (req, res) => {
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
  const collection = db.collection("users");
  const user = await collection.deleteOne({ _id: req.params.id });
  res.json({ message: "user deleted", user });
});

app.put("/products", async (req, res) => {
  const decodedUser = await verifyToken(
    req.headers.authorization.split(" ")[1],
  );
  if (!decodedUser) {
    res.statusCode = 401;
    return res.send({ message: "Unauthorized" });
  }
  const user = await getUser(decodedUser.uid);
  if (!user) {
    res.statusCode = 404;
    return res.send({ message: "User not found" });
  }
  if (user.role !== "seller") {
    res.statusCode = 403;
    return res.send({ message: "Forbidden" });
  }
  const collection = db.collection("products");
  const required = ["name", "price", "description", "image"];
  for (const key of required) {
    if (!req.body[key]) {
      res.statusCode = 400;
      return res.send({ message: "Enter Valid Body Data" });
    }
  }
  await collection.insertOne({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    stock: req.body.stock ?? 0,
    sellerId: user._id,
  });
  return res.json({ message: "product created" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(port, async () => {
  db = await connectToMongo();
  // initFirebase();
  console.log(`Example app listening on port ${port}`);
});
