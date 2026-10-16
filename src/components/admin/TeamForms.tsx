"use client";
import { useState } from "react";
import type { Role } from "@prisma/client";
import { setRole } from "@/app/admin/team/actions";
import { FormError } from "@/components/ui/Field";
import { useAction } from "./useAction";

export function AddMember() {
  const [email, setEmail] = useState("");
  const [role, setR] = useState<Role>("STAFF");
  const a = useAction();
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => setRole(email, role), { onOk: () => setEmail("") });
      }}
    >
      <div className="min-w-[240px] flex-1">
        <label htmlFor="member-email" className="mb-1.5 block text-sm font-medium">
          Account email
        </label>
        <input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field text-sm" placeholder="colleague@example.com" />
      </div>
      <div>
        <label htmlFor="member-role" className="mb-1.5 block text-sm font-medium">
          Role
        </label>
        <select id="member-role" value={role} onChange={(e) => setR(e.target.value as Role)} className="field w-40 text-sm">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button disabled={a.pending} className="btn btn-primary">
        Grant access
      </button>
      <div className="w-full">
        <FormError message={a.error} />
        {a.message && !a.error && <p className="label text-ok">{a.message}</p>}
      </div>
    </form>
  );
}

export function RoleSelect({ email, role, self }: { email: string; role: Role; self: boolean }) {
  const a = useAction();
  return (
    <div>
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
      {a.error && <p className="mt-1 text-xs text-danger">{a.error}</p>}
    </div>
  );
}
