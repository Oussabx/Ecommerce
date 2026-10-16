import { Body, PageHeader, Panel, td, th } from "@/components/admin/ui";
import { AddMember, RoleSelect } from "@/components/admin/TeamForms";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const me = await requireStaff({ admin: true });
  const team = await db.user.findMany({ where: { role: { in: ["STAFF", "ADMIN"] } }, orderBy: [{ role: "asc" }, { name: "asc" }] });
  return (
    <>
      <PageHeader title="Team" kicker="Who can open the admin" />
      <Body className="space-y-6">
        <Panel title="Give someone access">
          <p className="mb-4 text-sm text-muted">
            They first create a normal account on the store, then you grant a role here. <strong>Staff</strong> manage orders, products, inventory, customers and the inbox. <strong>Admins</strong> can also edit content, settings and the team.
          </p>
          <AddMember />
        </Panel>
        <div className="overflow-x-auto border border-rule bg-[#fbfaf7]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Since</th>
                <th className={th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {team.map((u) => (
                <tr key={u.id}>
                  <td className={td}>
                    {u.name} {u.id === me.id && <span className="label text-muted">(you)</span>}
                  </td>
                  <td className={`${td} text-muted`}>{u.email}</td>
                  <td className={`${td} text-muted`}>{formatDate(u.createdAt.toISOString())}</td>
                  <td className={td}>
                    <RoleSelect email={u.email} role={u.role} self={u.id === me.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Body>
    </>
  );
}
