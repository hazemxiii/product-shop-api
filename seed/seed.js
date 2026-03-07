require("dotenv").config();
const { connectToMongo } = require("../config/connect_mongo");

async function seed() {
  const db = await connectToMongo();

  const categoriesCollection = db.collection("categories");
  const productsCollection = db.collection("products");
  const ordersCollection = db.collection("orders");

  console.log("Clearing existing data from categories, products, and orders...");
  await Promise.all([
    categoriesCollection.deleteMany({}),
    productsCollection.deleteMany({}),
    ordersCollection.deleteMany({}),
  ]);

  const now = new Date();

  const categories = [
    {
      name: "Electronics",
      description: "Phones, laptops, and accessories",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Books",
      description: "Fiction, non-fiction, and educational books",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Clothing",
      description: "Men and women apparel",
      createdAt: now,
      updatedAt: now,
    },
  ];

  console.log("Inserting categories...");
  await categoriesCollection.insertMany(categories);

  const products = [
    {
      name: "iPhone 15",
      price: 999,
      description: "Latest Apple smartphone with advanced camera and performance",
      image: "https://via.placeholder.com/300x300?text=iPhone+15",
      category: "Electronics",
      stock: 10,
      sellerId: "seed-seller",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "MacBook Pro 14\"",
      price: 1999,
      description: "Powerful laptop for professionals and creators",
      image: "https://via.placeholder.com/300x300?text=MacBook+Pro",
      category: "Electronics",
      stock: 5,
      sellerId: "seed-seller",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Clean Architecture",
      price: 45,
      description: "A Craftsman's Guide to Software Structure and Design",
      image: "https://via.placeholder.com/300x300?text=Clean+Architecture",
      category: "Books",
      stock: 20,
      sellerId: "seed-seller",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "The Pragmatic Programmer",
      price: 40,
      description: "Classic book on modern software engineering practices",
      image: "https://via.placeholder.com/300x300?text=Pragmatic+Programmer",
      category: "Books",
      stock: 15,
      sellerId: "seed-seller",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Men's T‑Shirt",
      price: 25,
      description: "Comfortable cotton t‑shirt",
      image: "https://via.placeholder.com/300x300?text=Mens+Tshirt",
      category: "Clothing",
      stock: 30,
      sellerId: "seed-seller",
      createdAt: now,
      updatedAt: now,
    },
    {
      name: "Women's Jacket",
      price: 80,
      description: "Stylish and warm jacket",
      image: "https://via.placeholder.com/300x300?text=Womens+Jacket",
      category: "Clothing",
      stock: 12,
      sellerId: "seed-seller",
      createdAt: now,
      updatedAt: now,
    },
  ];

  console.log("Inserting products...");
  await productsCollection.insertMany(products);

  console.log("Database seeded successfully.");
}

seed()
  .then(() => {
    console.log("Seeding completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });

