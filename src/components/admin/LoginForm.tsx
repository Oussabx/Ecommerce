"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormError, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { isEmail } from "@/lib/client-validation";

/** Only allow same-site admin redirects after sign-in. */
const safeNext = (n: string | null) => (n && n.startsWith("/admin") ? n : "/admin");

/** Staff sign-in for the admin. Customers don't have accounts. */
export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!isEmail(email)) errs.email = "Enter a valid email address.";
        if (!password) errs.password = "Enter your password.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        setError(null);
        const res = await api("/api/auth/login", { email, password });
        setBusy(false);
        if (!res.ok) {
          setError(res.error ?? "Sign-in failed.");
          setErrors(res.fields ?? {});
          return;
        }
        router.replace(next);
        router.refresh();
      }}
      className="space-y-4"
    >
      <TextField label="Email" name="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? "Signing in…" : "Sign in"} <Icon name="arrow" size={16} className="btn-arrow" />
      </button>
      <p className="text-xs text-muted">Forgot your password? Ask another admin to reset it from the Team page.</p>
    </form>
  );
}
