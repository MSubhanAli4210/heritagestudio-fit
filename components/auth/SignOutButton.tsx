"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    setError("");
    const result = await authClient.signOut();
    if (result.error) {
      setError("Sign out failed. Please try again.");
      setPending(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={signOut}
        disabled={pending}
        className="border border-foreground px-5 py-3 text-xs font-bold tracking-[1px] transition hover:bg-foreground hover:text-white disabled:opacity-60"
      >
        {pending ? "SIGNING OUT…" : "SIGN OUT"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
