import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { currentUser, isStaff } from "@/server/auth";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · OSA" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Each page also calls requireStaff(); this keeps the shell itself private.
  const user = await currentUser();
  if (!user || !isStaff(user)) return <>{children}</>;
  const [orders, messages] = await Promise.all([db.order.count({ where: { status: "RECEIVED" } }), db.message.count({ where: { handled: false } })]);
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[256px_1fr] print:block print:bg-white">
      <AdminNav user={{ name: user.name, role: user.role }} badges={{ orders, messages }} />
      <div id="main" className="min-w-0">
        {children}
      </div>
    </div>
  );
}
