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
    <section className="border-t border-ink bg-paper" aria-labelledby="newsletter-title">
      <div className="container-x grid gap-8 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <h2 id="newsletter-title" className="display text-[clamp(3rem,9vw,7.5rem)]">
            Stay in
            <br />
            the know.
          </h2>
          <p className="mt-5 max-w-md text-muted">New arrivals, worthwhile deals, and technology worth paying attention to.</p>
        </div>
        <div className="flex flex-col justify-end md:col-span-5">
          {state === "done" ? (
            <div className="border border-ink bg-lime p-5" role="status">
              <p className="label">Subscribed</p>
              <p className="mt-2 font-semibold">You&apos;re on the list. We&apos;ll only write when there&apos;s something worth reading.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <label htmlFor="nl-email" className="label mb-2 block">
                Email address
              </label>
              <div className="flex border-b-2 border-ink">
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
                  className="min-w-0 flex-1 bg-transparent py-3 text-lg placeholder:text-subtle focus:outline-none"
                />
                <button type="submit" disabled={state === "loading"} className="label inline-flex items-center gap-2 px-2 hover:text-cobalt disabled:opacity-50">
                  {state === "loading" ? "Sending…" : "Subscribe"} <Icon name="arrow" size={16} />
                </button>
              </div>
              {error ? (
                <p id="nl-error" className="mt-2 text-sm text-danger">
                  {error}
                </p>
              ) : (
                <p id="nl-hint" className="mt-2 text-xs text-muted">
                  Unsubscribe any time. See our <a href="/privacy" className="underline">privacy policy</a>.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
