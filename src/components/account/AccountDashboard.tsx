"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "@/server/auth";
import { FormError, SelectField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { isPhone } from "@/lib/client-validation";
import { store } from "@/config/store";

export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = "Enter your name.";
        if (phone && !isPhone(phone)) errs.phone = "Enter a valid phone number.";
        setErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        const res = await api("/api/account/profile", { name, phone }, "PUT");
        setBusy(false);
        if (!res.ok) {
          setError(res.error ?? "Couldn't save.");
          setErrors(res.fields ?? {});
          return;
        }
        setError(null);
        setMsg("Saved.");
        router.refresh();
      }}
    >
      <TextField label="Name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <TextField label="Phone" name="phone" type="tel" optional autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
      <TextField label="Email" name="email" value={user.email} disabled optional hint="Contact us to change your email." className="sm:col-span-2" />
      <div className="flex items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Saving…" : "Save profile"}
        </button>
        {msg && (
          <span className="label inline-flex items-center gap-1 text-ok" role="status">
            <Icon name="check" size={14} /> {msg}
          </span>
        )}
      </div>
      <div className="sm:col-span-2">
        <FormError message={error} />
      </div>
    </form>
  );
}

export function Addresses({ user }: { user: PublicUser }) {
  const router = useRouter();
  const empty = { label: "", line1: "", line2: "", city: "", area: "", notes: "" };
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div>
      {user.addresses.length > 0 ? (
        <ul className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {user.addresses.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 bg-paper p-4">
              <p className="label">{a.label}</p>
              <address className="text-sm not-italic leading-relaxed text-ink-2">
                {a.line1}
                {a.line2 && <>, {a.line2}</>}
                <br />
                {a.city}, {a.area}
              </address>
              <button
                type="button"
                onClick={async () => {
                  const res = await api("/api/account/addresses", { id: a.id }, "DELETE");
                  if (res.ok) router.refresh();
                }}
                className="label mt-auto self-start text-muted hover:text-danger"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No saved addresses yet. Save one to check out faster.</p>
      )}

      {adding ? (
        <form
          noValidate
          className="mt-6 grid gap-4 border border-ink p-5 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const errs: Record<string, string> = {};
            if (!f.label.trim()) errs.label = "Give this address a name.";
            if (f.line1.trim().length < 3) errs.line1 = "Enter your street and building.";
            if (f.city.trim().length < 2) errs.city = "Enter your city or town.";
            if (!f.area) errs.area = "Choose a governorate.";
            setErrors(errs);
            if (Object.keys(errs).length) return;
            setBusy(true);
            const res = await api("/api/account/addresses", f);
            setBusy(false);
            if (!res.ok) {
              setError(res.error ?? "Couldn't save the address.");
              setErrors(res.fields ?? {});
              return;
            }
            setF(empty);
            setAdding(false);
            router.refresh();
          }}
        >
          <TextField label="Label" name="label" placeholder="Home, Office…" value={f.label} onChange={set("label")} error={errors.label} />
          <SelectField label="Governorate" name="area" value={f.area} onChange={set("area")} error={errors.area}>
            <option value="">Select…</option>
            {store.deliveryAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </SelectField>
          <TextField className="sm:col-span-2" label="Street, building, floor" name="line1" value={f.line1} onChange={set("line1")} error={errors.line1} />
          <TextField label="Apartment, landmark" name="line2" optional value={f.line2} onChange={set("line2")} />
          <TextField label="City / town" name="city" value={f.city} onChange={set("city")} error={errors.city} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" disabled={busy} className="btn btn-primary">
              {busy ? "Saving…" : "Save address"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
          <div className="sm:col-span-2">
            <FormError message={error} />
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="btn btn-outline mt-6">
          <Icon name="plus" size={16} /> Add address
        </button>
      )}
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await api("/api/auth/logout");
        router.replace("/");
        router.refresh();
      }}
      className="label inline-flex items-center gap-2 text-muted hover:text-ink"
    >
      <Icon name="logout" size={16} /> Sign out
    </button>
  );
}

