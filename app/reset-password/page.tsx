import Navbar from "@/components/layout/Navbar";
import AuthForm from "@/components/auth/AuthForm";

export const instant = false;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  return (
    <main>
      <Navbar />
      <AuthForm mode="reset-password" token={token} />
    </main>
  );
}
