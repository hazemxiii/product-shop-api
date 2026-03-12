# ProductShop API

The ProductShop API is the robust Express.js & MongoDB backend that powers the ProductShop e-commerce application. It provides secure, robust data management for users, products, categories, reviews, and complex payment transactions.

---

## Key Features

### 🔒 Authentication & Authorization

- **Firebase Admin Integration:** Securely verifies user tokens using Firebase Auth.
- **Role-Based Middlewares:** Restricts controller access using specialized guards like `requireAuth`, `requireAdmin`, and `requireSeller`.

### 📦 Product & Category Management

- **Aggregation Pipelines:** Utilizes MongoDB `$lookup` functions to merge Category data seamlessly into Product GET requests.
- **Stock Management Systems:** Exposes controllers for sellers to modify stock while restricting access to organically generated fields (like average ratings).
- **Category Controllers:** Full CRUD operations allowing admins to maintain the store's item taxonomy.

### 🛒 Carts & Checkout

- **Persistent Carts:** Cart operations are synchronized with the database in real-time.
- **Dynamic Order Population:** Uses MongoDB aggregations to fetch active product details (latest prices, names, images) whenever a user views their cart or places an order.

### 💳 Payment Processing

- **PayPal Server SDK:** Server-side implementation of PayPal capturing intents to securely process standard credit card / digital wallet transactions.
- **Cash On Delivery (COD) Flow:** Dedicated endpoints to record COD intents.
- **Order Fulfillment Safety:** Logic to automatically decrement product `stock` amounts across multiple products ONLY upon a successfully confirmed transaction (`confirmPayment` and `confirmPaymentCash`).
- **Global Payment Queries:** Dedicated endpoints spanning user-specific lookups (`findByUserId`) or Admin global lookups (`findAll`).

### 🌟 Reviews System

- **Dynamic Rating Calculation:** Re-calculates and caches the average rating of a product directly on the `Product` document whenever a `Review` is added, updated, or removed.

---

## Prerequisites

- **Node.js**: v18+
- **MongoDB**: A running local or remote MongoDB instance.
- **PayPal Developer Keys**: Client ID and Client Secret from a PayPal Developer Sandbox/Live account.
- **Firebase Admin Credentials**: A JSON credentials file for verifying frontend tokens.

---

## Environment Configuration

Create a `.env` file in the root of the project with the following (sample) variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/productShop
CLIENT_ID=your_paypal_client_id
CLIENT_SECRET=your_paypal_client_secret
```

---

## Getting Started

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run the Server:**

   ```bash
   node server.js
   ```

   Or using a process manager like nodemon for development:

   ```bash
   npx nodemon server.js
   ```

3. The API will typically be exposed at `http://localhost:3000`.
