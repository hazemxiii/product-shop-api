import admin from "firebase-admin";

import serviceAccount from "./private.json" with { type: "json" };

export function initFirebase() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function verifyToken(token) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
}
initFirebase();
