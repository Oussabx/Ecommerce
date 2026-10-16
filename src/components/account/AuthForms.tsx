"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormError, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { isEmail } from "@/lib/client-validation";

/** Only allow same-site relative redirects after sign-in. */
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/account");

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
      <TextField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      <div className="flex justify-end">
        <Link href="/account/forgot-password" className="text-sm underline underline-offset-4">
          Forgot password?
        </Link>
      </div>
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? "Signing in…" : "Sign in"} <Icon name="arrow" size={16} className="btn-arrow" />
      </button>
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!f.name.trim()) errs.name = "Enter your name.";
        if (!isEmail(f.email)) errs.email = "Enter a valid email address.";
        if (f.password.length < 8) errs.password = "Use at least 8 characters.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        setError(null);
        const res = await api("/api/auth/register", f);
        setBusy(false);
        if (!res.ok) {
          setError(res.error ?? "Couldn't create your account.");
          setErrors(res.fields ?? {});
          return;
        }
        router.replace(next);
        router.refresh();
      }}
      className="space-y-4"
    >
      <TextField label="Full name" name="name" autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
      <TextField label="Password" name="password" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errors.password} hint="At least 8 characters." />
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? "Creating account…" : "Create account"} <Icon name="arrow" size={16} className="btn-arrow" />
      </button>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { emailConfigured: boolean }>(null);
  const [busy, setBusy] = useState(false);

  if (done) {
    return (
      <div className="space-y-4" role="status">
        {done.emailConfigured ? (
          <p>If an account exists for <strong>{email}</strong>, we&apos;ve emailed a link to reset your password. It expires in one hour.</p>
        ) : (
          <div className="border border-ink bg-lime p-4 text-sm">
            <p className="label">Email not connected</p>
            <p className="mt-2">
              Email delivery isn&apos;t set up for this store yet, so we can&apos;t send the reset link to your inbox. If an account exists, a one-hour reset link has been generated for the store team — <Link href="/contact" className="underline">contact us</Link> and we&apos;ll help you back in.
            </p>
          </div>
        )}
        <Link href="/account/login" className="btn btn-outline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!isEmail(email)) return setErr("Enter a valid email address.");
        setErr(undefined);
        setBusy(true);
        const res = await api<{ emailConfigured: boolean }>("/api/auth/forgot", { email });
        setBusy(false);
        if (!res.ok || !res.data) return setError(res.error ?? "Something went wrong.");
        setDone({ emailConfigured: !!res.data.emailConfigured });
      }}
    >
      <TextField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) return <FormError message="This reset link is missing its token. Request a new link." />;
  if (done)
    return (
      <div className="space-y-4" role="status">
        <p>Your password has been updated. Other devices have been signed out.</p>
        <button type="button" onClick={() => router.push("/account/login")} className="btn btn-primary">
          Sign in
        </button>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (password.length < 8) errs.password = "Use at least 8 characters.";
        if (confirm !== password) errs.confirm = "Passwords don't match.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        const res = await api("/api/auth/reset", { token, password });
        setBusy(false);
        if (!res.ok) return setError(res.error ?? "Couldn't reset your password.");
        setDone(true);
      }}
    >
      <TextField label="New password" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint="At least 8 characters." />
      <TextField label="Confirm password" name="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
