import { MongoClient } from "mongodb";

const uri = process.env.mongo_uri;
const client = new MongoClient(uri);

export async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("product-shop");
  } catch (error) {
    console.log(error);
    await client.close();
  }
}
