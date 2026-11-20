import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const VISITOR_COOKIE = "hs-visitor";

export function hashVisitorToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getOrCreateVisitorToken() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(VISITOR_COOKIE)?.value;
  const token = stored && /^[a-f0-9]{64}$/.test(stored)
    ? stored
    : randomBytes(32).toString("hex");

  if (token !== stored) {
    cookieStore.set(VISITOR_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return token;
}
