"use client";
import { useState } from "react";
import type { Role } from "@prisma/client";
import { addMember, resetMemberPassword, setRole } from "@/app/admin/team/actions";
import { FormError } from "@/components/ui/Field";
import { useAction } from "./useAction";

export function AddMember() {
  const [f, setF] = useState({ name: "", email: "", password: "", role: "STAFF" as "STAFF" | "ADMIN" });
  const a = useAction();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <form
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_140px_auto] lg:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => addMember(f), { onOk: () => setF({ name: "", email: "", password: "", role: "STAFF" }) });
      }}
    >
      {(
        [
          ["name", "Name", "text"],
          ["email", "Email", "email"],
          ["password", "Temporary password", "text"],
        ] as const
      ).map(([k, label, type]) => (
        <label key={k} className="block">
          <span className="mb-1.5 block text-sm font-medium">{label}</span>
          <input type={type} value={f[k]} onChange={set(k)} className="field text-sm" aria-invalid={!!a.fields[k]} autoComplete="off" />
          {a.fields[k] && <span className="mt-1 block text-xs text-danger">{a.fields[k]}</span>}
        </label>
      ))}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Role</span>
        <select value={f.role} onChange={set("role")} className="field text-sm">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <button disabled={a.pending} className="btn btn-primary">
        Add
      </button>
      <div className="sm:col-span-2 lg:col-span-5">
        <FormError message={a.error && !Object.keys(a.fields).length ? a.error : null} />
        {a.message && !a.error && <p className="label text-ok">{a.message}</p>}
      </div>
    </form>
  );
}

export function MemberActions({ email, role, self }: { email: string; role: Role; self: boolean }) {
  const a = useAction();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={role}
        disabled={a.pending || self}
        onChange={(e) => {
          const r = e.target.value as Role;
          if (r === "CUSTOMER" && !confirm(`Remove admin access for ${email}?`)) return;
          a.exec(() => setRole(email, r));
        }}
        className="field !min-h-9 w-36 !py-1 text-sm"
        aria-label={`Role for ${email}`}
      >
        <option value="STAFF">Staff</option>
        <option value="ADMIN">Admin</option>
        <option value="CUSTOMER">Remove access</option>
      </select>
      {!self && (
        <button
          type="button"
          onClick={() => {
            const pw = prompt(`New password for ${email} (at least 10 characters):`);
            if (pw) a.exec(() => resetMemberPassword(email, pw), { refresh: false });
          }}
          className="label text-muted hover:text-ink"
        >
          Reset password
        </button>
      )}
      {a.error && <p className="w-full text-xs text-danger">{a.error}</p>}
      {a.message && !a.error && <p className="label w-full text-ok">{a.message}</p>}
    </div>
  );
}
