import Navbar from "@/components/layout/Navbar";
import AuthForm from "@/components/auth/AuthForm";

export default function VerifyEmailPage() {
  return (
    <main>
      <Navbar />
      <AuthForm mode="verify-email" />
    </main>
  );
}
