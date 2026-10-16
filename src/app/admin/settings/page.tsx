import { Body, PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireStaff } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { emailConfigured } from "@/server/email";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireStaff({ admin: true });
  const { store } = await getSettings();
  const integrations = [
    { name: "Database", ok: true, note: "PostgreSQL connected" },
    { name: "Image uploads", ok: !!process.env.BLOB_READ_WRITE_TOKEN, note: process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : process.env.NODE_ENV === "production" ? "Set BLOB_READ_WRITE_TOKEN" : "Local folder (development)" },
    { name: "Email", ok: emailConfigured, note: emailConfigured ? "Resend" : "Set RESEND_API_KEY and EMAIL_FROM" },
    { name: "Online payments", ok: false, note: "Not connected — cash on delivery only" },
  ];
  return (
    <>
      <PageHeader title="Settings" kicker="Store details used across the website">
        <ul className="mt-4 flex flex-wrap gap-2">
          {integrations.map((i) => (
            <li key={i.name} className="label flex items-center gap-2 border border-rule-strong px-2.5 py-1.5">
              <span className={`size-2 rounded-full ${i.ok ? "bg-ok" : "bg-warn"}`} aria-hidden />
              {i.name}: <span className="text-muted">{i.note}</span>
            </li>
          ))}
        </ul>
      </PageHeader>
      <Body>
        <SettingsForm initial={store} />
      </Body>
    </>
  );
}
