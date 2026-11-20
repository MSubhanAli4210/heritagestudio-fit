import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Resend } from "resend";
import { getMongoClient } from "@/lib/mongodb";

const appUrl = process.env.BETTER_AUTH_URL ?? (
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"
);
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!appUrl) {
  throw new Error("Missing required environment variable: BETTER_AUTH_URL");
}
if (!authSecret || authSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be set to a random value of at least 32 characters.");
}

const databaseName = process.env.MONGODB_DB_NAME || "heuristicstudio";
const mongoClient = getMongoClient();
const database = mongoClient.db(databaseName);
const adminEmails = new Set(
  (process.env.AUTH_ADMIN_EMAILS ?? "")
    .split(/[;,]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendAuthEmail({
  to,
  subject,
  title,
  message,
  url,
  action,
}: {
  to: string;
  subject: string;
  title: string;
  message: string;
  url: string;
  action: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and AUTH_EMAIL_FROM.");
  }

  const safeUrl = escapeHtml(url);
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeAction = escapeHtml(action);
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to: [to],
    subject,
    text: `${title}\n\n${message}\n\n${url}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#292721"><h1>${safeTitle}</h1><p>${safeMessage}</p><p><a href="${safeUrl}" style="display:inline-block;background:#292721;color:#fff;padding:12px 20px;text-decoration:none">${safeAction}</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
  });

  if (error) {
    console.error("Authentication email delivery failed:", error.name);
    throw new Error("Could not send authentication email.");
  }
}

export const auth = betterAuth({
  appName: "Heritage Studio",
  baseURL: appUrl,
  secret: authSecret,
  trustedOrigins: [new URL(appUrl).origin],
  database: mongodbAdapter(database, { client: mongoClient }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your Heritage Studio password",
        title: "Reset your password",
        message: "Use the secure link below to choose a new password.",
        url,
        action: "Reset password",
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your Heritage Studio email",
        title: "Verify your email",
        message: "Confirm your email address to activate your account.",
        url,
        action: "Verify email",
      });
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!adminEmails.has(user.email.trim().toLowerCase())) return;
          return { data: { ...user, role: "admin" } };
        },
      },
    },
  },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
