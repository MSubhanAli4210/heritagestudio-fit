import Navbar from "@/components/layout/Navbar";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main>
      <Navbar />
      <AuthForm mode="sign-up" />
    </main>
  );
}
