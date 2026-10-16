import Link from "next/link";
import { Body, Empty, PageHeader, Panel } from "@/components/admin/ui";
import { HandledToggle, RemoveSubscriber } from "@/components/admin/SmallActions";
import { requireStaff } from "@/server/auth";
import { db } from "@/server/db";
import { cn } from "@/lib/format";

export const metadata = { title: "Inbox" };
const topics: Record<string, string> = { product: "Product question", order: "Existing order", warranty: "Warranty / repair", other: "Other" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  await requireStaff();
  const { view } = await searchParams;
  const showHandled = view === "handled";
  const [messages, openCount, subscribers, subCount] = await Promise.all([
    db.message.findMany({ where: { handled: showHandled }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.message.count({ where: { handled: false } }),
    db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.subscriber.count(),
  ]);
  return (
    <>
      <PageHeader title="Inbox" kicker={`${openCount} open ${openCount === 1 ? "message" : "messages"}`}>
        <nav className="mt-4 flex gap-1">
          <Link href="/admin/messages" className={cn("label inline-flex h-9 items-center border px-3", !showHandled ? "border-ink bg-ink text-paper" : "border-rule-strong")}>
            Open
          </Link>
          <Link href="/admin/messages?view=handled" className={cn("label inline-flex h-9 items-center border px-3", showHandled ? "border-ink bg-ink text-paper" : "border-rule-strong")}>
            Handled
          </Link>
        </nav>
      </PageHeader>
      <Body className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {messages.length ? (
            messages.map((m) => (
              <article key={m.id} className="border border-rule bg-[#fbfaf7] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to OSA Techstore")}`} className="underline underline-offset-4">
                        {m.email}
                      </a>
                      {m.phone && <> · {m.phone}</>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="label bg-paper-3 px-2 py-0.5">{topics[m.topic] ?? m.topic}</p>
                    <p className="label mt-1 text-muted">{m.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
                <div className="mt-3 flex justify-end">
                  <HandledToggle id={m.id} handled={m.handled} />
                </div>
              </article>
            ))
          ) : (
            <Empty title={showHandled ? "No handled messages yet." : "Inbox zero."}>Messages from the contact form appear here.</Empty>
          )}
        </div>
        <Panel
          title={`Newsletter · ${subCount} subscribers`}
          actions={
            subCount > 0 ? (
              <a href="/admin/subscribers.csv" className="label hover:underline">
                Export CSV
              </a>
            ) : undefined
          }
        >
          {subscribers.length ? (
            <ul className="divide-y divide-rule text-sm">
              {subscribers.map((s) => (
                <li key={s.email} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0 truncate">{s.email}</span>
                  <RemoveSubscriber email={s.email} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No subscribers yet.</p>
          )}
          {subCount > subscribers.length && <p className="mt-2 text-xs text-muted">Showing the latest {subscribers.length}. Export for the full list.</p>}
        </Panel>
      </Body>
    </>
  );
}
