import { MongoClient } from "mongodb";

declare global {
  var heuristicMongoClient: MongoClient | undefined;
  var heuristicMongoIndexesPromise: Promise<void> | undefined;
}

const options = {
  // Vercel functions are short-lived and can scale horizontally; keep each instance's pool small.
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
};

export function getMongoClient() {
  if (globalThis.heuristicMongoClient) return globalThis.heuristicMongoClient;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  const client = new MongoClient(uri, options);
  if (process.env.NODE_ENV !== "production") globalThis.heuristicMongoClient = client;
  return client;
}

export async function getDatabase() {
  const client = getMongoClient();
  await client.connect();
  const database = client.db(process.env.MONGODB_DB_NAME || "heuristicstudio");
  globalThis.heuristicMongoIndexesPromise ??= Promise.all([
    database.collection("orders").createIndex({ visitorTokenHash: 1, createdAt: -1 }),
    database.collection("orders").createIndex({ userId: 1, createdAt: -1 }),
    database.collection("rateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection("products").createIndex({ id: 1 }, { unique: true }),
    database.collection("coupons").createIndex({ code: 1 }, { unique: true }),
  ]).then(() => undefined);
  await globalThis.heuristicMongoIndexesPromise;
  return database;
}
