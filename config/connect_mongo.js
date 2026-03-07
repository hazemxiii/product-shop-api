const { MongoClient } = require("mongodb");

const uri = process.env.mongo_uri;
const client = new MongoClient(uri);
let dbInstance = null;

async function connectToMongo() {
  // Reuse existing connection if available
  if (dbInstance) {
    return dbInstance;
  }

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    dbInstance = client.db("product-shop");
    return dbInstance;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

function getDb() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectToMongo() first.");
  }

  return dbInstance;
}

module.exports = {
  connectToMongo,
  getDb,
};
