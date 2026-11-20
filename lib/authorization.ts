import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!session.user.emailVerified) redirect("/verify-email");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "admin") redirect("/account");
  return session;
}

export async function getAdminApiError() {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ error: "Sign in to continue." }, { status: 401 });
  }
  if (!session.user.emailVerified || session.user.role !== "admin") {
    return Response.json({ error: "Administrator access is required." }, { status: 403 });
  }
  return null;
}
