const { verifyToken } = require("../config/firebase_helper");
const { getDb } = require("../config/connect_mongo");
const createUserModel = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ message: "Authorization token required (Bearer)" });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const db = getDb();
    const userModel = createUserModel(db);
    const user = await userModel.findById(decoded.uid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: ensure email verified for password sign-in
    const isPasswordProvider =
      decoded.firebase?.sign_in_provider === "password";
    const emailVerified =
      decoded.email_verified ?? decoded.emailVerified ?? false;

    if (isPasswordProvider && !emailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    req.auth = { decoded, user };
    next();
  } catch (err) {
    next(err);
  }
}

async function requireAdmin(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "Authorization token required (Bearer)" });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const db = getDb();
  const userModel = createUserModel(db);
  const user = await userModel.findById(decoded.uid);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admins can perform this action" });
  }

  next();
}

function requireSeller(req, res, next) {
  const user = req.auth?.user;

  if (!user) {
    return res
      .status(500)
      .json({ message: "Auth middleware not initialized for this request" });
  }

  if (user.role !== "seller") {
    return res
      .status(403)
      .json({ message: "Only sellers can perform this action" });
  }

  next();
}

module.exports = {
  requireAuth,
  requireSeller,
  requireAdmin,
};

