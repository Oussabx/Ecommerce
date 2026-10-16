"use client";
import { useState } from "react";
import { FormError, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { isEmail, isPhone } from "@/lib/client-validation";

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", topic: "product", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (done)
    return (
      <div className="flex flex-col items-center py-8 text-center" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-ok/15 text-ok">
          <Icon name="check" size={28} />
        </span>
        <p className="mt-4 text-sm font-medium text-ok">Message sent</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">Thanks, {f.name.split(" ")[0]}.</p>
        <p className="mt-2 text-muted">We&apos;ve received your message and will reply to {f.email}.</p>
      </div>
    );

  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!f.name.trim()) errs.name = "Enter your name.";
        if (!isEmail(f.email)) errs.email = "Enter a valid email address.";
        if (f.phone && !isPhone(f.phone)) errs.phone = "Enter a valid phone number.";
        if (f.message.trim().length < 10) errs.message = "Tell us a little more (10+ characters).";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        const res = await api("/api/contact", f);
        setBusy(false);
        if (!res.ok) {
          setError(res.error ?? "Couldn't send your message.");
          setErrors(res.fields ?? {});
          return;
        }
        setDone(true);
      }}
    >
      <TextField label="Name" name="name" autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} />
      <TextField label="Email" name="email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
      <TextField label="Phone" name="phone" type="tel" optional autoComplete="tel" value={f.phone} onChange={set("phone")} error={errors.phone} />
      <SelectField label="Topic" name="topic" value={f.topic} onChange={set("topic")}>
        <option value="product">A product question</option>
        <option value="order">An existing order</option>
        <option value="repair">A faulty product</option>
        <option value="other">Something else</option>
      </SelectField>
      <TextAreaField className="sm:col-span-2" label="Message" name="message" rows={6} value={f.message} onChange={set("message")} error={errors.message} hint="Include your order reference if your message is about an order." />
      <div className="space-y-3 sm:col-span-2">
        <FormError message={error} />
        <button type="submit" disabled={busy} className="btn btn-primary w-full sm:w-auto">
          {busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
