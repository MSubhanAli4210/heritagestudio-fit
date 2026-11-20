import { getDatabase } from "@/lib/mongodb";
import { hashVisitorToken } from "@/lib/visitor-token";

type RateLimitRecord = {
  _id: string;
  count: number;
  expiresAt: Date;
};

export async function consumeRateLimit(
  token: string,
  action: "upload" | "order",
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const expiresAt = new Date((bucket + 2) * windowMs);
  const key = `${action}:${hashVisitorToken(token)}:${bucket}`;
  const result = await (await getDatabase())
    .collection<RateLimitRecord>("rateLimits")
    .findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: "after", includeResultMetadata: false }
    );

  if (!result) {
    throw new Error("Rate limit counter update returned no document.");
  }

  return {
    allowed: result.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil(((bucket + 1) * windowMs - now) / 1000)),
  };
}
