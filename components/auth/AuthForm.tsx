"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify-email";

const headings: Record<AuthMode, { eyebrow: string; title: string; submit: string }> = {
  "sign-in": { eyebrow: "SIGN IN", title: "Welcome back", submit: "SIGN IN" },
  "sign-up": { eyebrow: "JOIN THE STUDIO", title: "Create your account", submit: "CREATE ACCOUNT" },
  "forgot-password": { eyebrow: "ACCOUNT RECOVERY", title: "Reset your password", submit: "SEND RESET LINK" },
  "reset-password": { eyebrow: "ACCOUNT RECOVERY", title: "Choose a new password", submit: "UPDATE PASSWORD" },
  "verify-email": { eyebrow: "ONE LAST STEP", title: "Verify your email", submit: "RESEND VERIFICATION" },
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[#c9c2b6] bg-white/70 px-4 py-3.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10";

export default function AuthForm({
  mode,
  callbackURL = "/account",
  token,
}: {
  mode: AuthMode;
  callbackURL?: string;
  token?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const heading = headings[mode];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    try {
      if (mode === "sign-in") {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL,
        });
        if (result.error) throw new Error(result.error.message || "Sign in failed.");
        router.replace(callbackURL);
        router.refresh();
      } else if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          name: String(formData.get("name") ?? "").trim(),
          email,
          password,
          callbackURL: "/account",
        });
        if (result.error) throw new Error(result.error.message || "Account creation failed.");
        setMessage("If this address can be registered, a verification link will arrive by email. Verify it before signing in.");
      } else if (mode === "forgot-password") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) throw new Error(result.error.message || "We could not send a reset link.");
        setMessage("If an account exists for that address, a password reset link will arrive by email.");
      } else if (mode === "reset-password") {
        if (!token) throw new Error("This password reset link is invalid or expired.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error(result.error.message || "We could not reset your password.");
        setMessage("Your password has been updated. You can now sign in.");
      } else {
        const result = await authClient.sendVerificationEmail({
          email,
          callbackURL: "/account",
        });
        if (result.error) throw new Error(result.error.message || "We could not send a verification link.");
        setMessage("If this address needs verification, a link will arrive by email.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="grid min-h-[calc(100svh-78px)] bg-background lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
      <aside className="relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden bg-sand px-[7%] py-8 sm:min-h-[400px] lg:min-h-[calc(100svh-78px)] lg:px-[10%] lg:py-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgba(255,255,255,0.8),transparent_48%),linear-gradient(135deg,#e8e1d5_0%,#d9cebd_100%)]" />
        <div className="absolute bottom-0 right-0 -z-10 h-[82%] w-[75%] opacity-90 sm:w-[62%] lg:h-[78%] lg:w-[72%]">
          <Image
            src="/images/branding/hero-hoodie.png?v=2"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 75vw"
            className="object-contain object-bottom mix-blend-multiply"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#d9cebd]/65 to-transparent" />

        <Link href="/" aria-label="Heritage Studio home" className="relative z-10 inline-flex w-fit items-center">
          <Image
            src="/icons/HS%20Logo%20b.png"
            alt="Heritage Studio"
            width={2234}
            height={599}
            className="h-auto w-[135px]"
          />
        </Link>

        <div className="relative z-10 max-w-[520px] pb-10 pt-16 sm:pb-12 lg:pb-16 lg:pt-20">
          <p className="mb-5 text-[10px] font-bold tracking-[3px] text-accent">HERITAGE STUDIO · CUSTOM APPAREL</p>
          <h2 className="max-w-[480px] font-serif text-[clamp(38px,5vw,68px)] leading-[1.05] tracking-[-0.035em]">
            Wear your<br />
            <span className="italic text-accent">own expression.</span>
          </h2>
          <p className="mt-5 max-w-[390px] text-sm leading-7 text-foreground/70">
            Premium pieces, made personal. Pick a garment, add your idea, and make it yours.
          </p>
          <div className="mt-8 grid max-w-[470px] grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-sm">
              <span className="mb-3 grid size-8 place-items-center rounded-lg bg-background text-accent" aria-hidden="true">✳</span>
              <p className="text-xs font-bold">Made your way</p>
              <p className="mt-1 text-[11px] leading-5 text-muted">Personal designs on quality essentials.</p>
            </div>
            <div className="rounded-xl border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-sm">
              <span className="mb-3 grid size-8 place-items-center rounded-lg bg-background text-accent" aria-hidden="true">↗</span>
              <p className="text-xs font-bold">Your studio, anytime</p>
              <p className="mt-1 text-[11px] leading-5 text-muted">Keep your account and orders close.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 hidden text-[10px] font-semibold tracking-[1px] text-muted sm:block">
          THOUGHTFULLY MADE · UNIQUELY YOURS
        </p>
      </aside>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-20">
        <div className="w-full max-w-[460px]">
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[3px] text-accent">{heading.eyebrow}</p>
            <h1 className="mt-3 font-serif text-[clamp(36px,4vw,48px)] leading-tight tracking-[-0.025em]">{heading.title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              {mode === "sign-in" && "Enter your details to access your Heritage Studio account."}
              {mode === "sign-up" && "Join us and keep your custom creations all in one place."}
              {mode === "forgot-password" && "We’ll send a secure password reset link to your email."}
              {mode === "reset-password" && "Choose a strong new password for your account."}
              {mode === "verify-email" && "Enter your email to receive a fresh verification link."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === "sign-up" && (
              <label className="block text-xs font-bold text-foreground/85">
                Full name
                <input name="name" required autoComplete="name" maxLength={120} placeholder="Your full name" className={inputClass} />
              </label>
            )}
            {mode !== "reset-password" && (
              <label className="block text-xs font-bold text-foreground/85">
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={254}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                />
              </label>
            )}
            {(mode === "sign-in" || mode === "sign-up" || mode === "reset-password") && (
              <label className="block text-xs font-bold text-foreground/85">
                <span className="flex items-center justify-between">
                  {mode === "reset-password" ? "New password" : "Password"}
                  {mode === "sign-in" && (
                    <Link href="/forgot-password" className="font-medium text-accent transition hover:text-foreground">
                      Forgot password?
                    </Link>
                  )}
                </span>
                <span className="relative block">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={128}
                    placeholder={mode === "sign-in" ? "Enter your password" : "At least 12 characters"}
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                    className={`${inputClass} pr-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-bold text-muted transition hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </span>
                {mode !== "sign-in" && (
                  <span className="mt-2 block text-[11px] font-normal text-muted">Use at least 12 characters.</span>
                )}
              </label>
            )}

            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-xl border border-accent/15 bg-accent/5 px-4 py-3 text-sm leading-6 text-accent-dark">{message}</p>}

            <button
              type="submit"
              disabled={pending || (mode === "reset-password" && !token)}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-5 py-4 text-xs font-bold tracking-[1.5px] text-white shadow-[0_10px_24px_rgba(41,39,33,0.16)] transition hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-[0_14px_28px_rgba(41,39,33,0.20)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span>{pending ? "PLEASE WAIT…" : heading.submit}</span>
              {!pending && <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>}
            </button>
          </form>

          <div className="mt-7 text-center text-xs text-muted">
            {mode === "sign-in" && (
              <p>
                Don’t have an account?{" "}
                <Link href="/signup" className="font-bold text-accent underline decoration-accent/30 underline-offset-4 transition hover:text-foreground">
                  Create one
                </Link>
              </p>
            )}
            {mode === "sign-in" && (
              <Link href="/verify-email" className="mt-3 inline-block transition hover:text-foreground">Resend verification email</Link>
            )}
            {mode === "sign-up" && (
              <p>
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-accent underline decoration-accent/30 underline-offset-4 transition hover:text-foreground">
                  Sign in
                </Link>
              </p>
            )}
            {(mode === "forgot-password" || mode === "verify-email") && (
              <Link href="/login" className="font-semibold transition hover:text-foreground">Back to sign in</Link>
            )}
            {mode === "reset-password" && message && (
              <Link href="/login" className="font-semibold transition hover:text-foreground">Go to sign in</Link>
            )}
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted">
            <svg className="size-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.5 2.8 7.7 7 10 4.2-2.3 7-5.5 7-10V6l-7-3Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
            </svg>
            Secure access to your Heritage Studio account
          </p>
        </div>
      </div>
    </section>
  );
}
