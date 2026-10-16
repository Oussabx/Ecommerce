"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormError, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await api("/api/auth/logout");
        router.replace("/admin/login");
        router.refresh();
      }}
      className="label inline-flex items-center gap-2 text-paper/60 hover:text-lime"
    >
      <Icon name="logout" size={14} /> Sign out
    </button>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setDone(false);
        const errs: Record<string, string> = {};
        if (!current) errs.current = "Enter your current password.";
        if (next.length < 8) errs.next = "Use at least 8 characters.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        const res = await api("/api/account/password", { current, next });
        setBusy(false);
        if (!res.ok) {
          setError(res.error ?? "Couldn't change your password.");
          setErrors(res.fields ?? {});
          return;
        }
        setError(null);
        setCurrent("");
        setNext("");
        setDone(true);
      }}
    >
      <TextField label="Current password" name="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.current} />
      <TextField label="New password" name="next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} hint="At least 8 characters. Other devices will be signed out." />
      <FormError message={error} />
      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Saving…" : "Change password"}
        </button>
        {done && (
          <span className="label inline-flex items-center gap-1 text-ok" role="status">
            <Icon name="check" size={14} /> Password changed
          </span>
        )}
      </div>
    </form>
  );
}
