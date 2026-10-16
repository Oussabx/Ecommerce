"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address, like name@example.com.");
      return;
    }
    setError(null);
    setState("loading");
    const res = await api("/api/newsletter", { email });
    if (res.ok) setState("done");
    else {
      setState("idle");
      setError(res.fields?.email ?? res.error ?? "Something went wrong.");
    }
  }

  return (
    <section className="container-x py-16 md:py-24" aria-labelledby="newsletter-title">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="newsletter-title" className="display text-[clamp(1.75rem,3.5vw,2.5rem)]">
          Stay in the know
        </h2>
        <p className="mt-2 text-lg text-muted">New arrivals, worthwhile deals, and technology worth paying attention to.</p>
        {state === "done" ? (
          <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-2xl bg-ok/15 p-4 text-left" role="status">
            <Icon name="check" size={20} className="shrink-0 text-ok" />
            <p className="font-medium">You&apos;re on the list. We&apos;ll only write when there&apos;s something worth reading.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mx-auto mt-8 max-w-md">
            <label htmlFor="nl-email" className="sr-only">
              Email address
            </label>
            <div className="flex gap-2 rounded-full bg-paper-2 p-1.5 focus-within:ring-4 focus-within:ring-accent/15">
              <input
                id="nl-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!error}
                aria-describedby={error ? "nl-error" : "nl-hint"}
                className="min-w-0 flex-1 bg-transparent px-4 placeholder:text-subtle focus:outline-none"
              />
              <button type="submit" disabled={state === "loading"} className="btn btn-primary !min-h-11 !px-5">
                {state === "loading" ? "Sending…" : "Subscribe"}
              </button>
            </div>
            {error ? (
              <p id="nl-error" className="mt-3 text-sm text-danger">
                {error}
              </p>
            ) : (
              <p id="nl-hint" className="mt-3 text-xs text-muted">
                Unsubscribe any time. See our <a href="/privacy" className="underline">privacy policy</a>.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
