import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017/";
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
