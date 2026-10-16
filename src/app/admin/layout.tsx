import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { currentUser, isStaff } from "@/server/auth";
import { db, hasDatabase } from "@/server/db";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · OSA" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasDatabase) {
    return (
      <div className="container-x py-20">
        <p className="text-sm font-medium text-muted">Admin</p>
        <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3.5rem)]">Connect a database to use the admin.</h1>
        <p className="mt-4 max-w-xl text-muted">
          The store is running on its built-in sample catalogue. To manage orders, products and settings, connect a Postgres database: in Vercel open the project → Storage → Create Database → Neon → Connect (leave the prefix empty), then redeploy.
          The first deploy afterwards prints your admin login in the build log.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to the store
        </Link>
      </div>
    );
  }
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
