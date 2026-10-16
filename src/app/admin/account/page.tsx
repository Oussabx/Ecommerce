import { Body, PageHeader, Panel } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/StaffAccount";
import { requireStaff } from "@/server/auth";

export const metadata = { title: "My account" };

export default async function StaffAccountPage() {
  const user = await requireStaff();
  return (
    <>
      <PageHeader title="My account" kicker={`${user.name} · ${user.email}`} />
      <Body className="max-w-xl">
        <Panel title="Change password">
          <PasswordForm />
        </Panel>
      </Body>
    </>
  );
}
