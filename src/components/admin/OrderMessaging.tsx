"use client";
import { resendReceiptEmail } from "@/app/admin/orders/actions";
import { Icon } from "@/components/ui/Icon";
import { useAction } from "./useAction";

/** One-click WhatsApp confirmation (pre-written) + receipt email controls for an order. */
export function OrderMessaging({ orderRef, waHref, emailReady }: { orderRef: string; waHref: string | null; emailReady: boolean }) {
  const a = useAction();
  return (
    <div className="space-y-2">
      {waHref ? (
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn w-full bg-[#25D366] text-on-accent hover:bg-[#1ebe5a]">
          <Icon name="chat" size={16} /> Send WhatsApp confirmation
        </a>
      ) : (
        <p className="text-sm text-muted">The phone number can&apos;t be used for WhatsApp.</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <a href={`/admin/orders/${orderRef}/receipt`} target="_blank" className="btn btn-outline !min-h-10 text-sm">
          Preview receipt
        </a>
        <button type="button" disabled={a.pending} onClick={() => a.exec(() => resendReceiptEmail(orderRef))} className="btn btn-outline !min-h-10 text-sm" title={emailReady ? undefined : "Connect email first"}>
          {a.pending ? "Sending…" : "Resend email"}
        </button>
      </div>
      {a.error && <p className="text-sm text-danger">{a.error}</p>}
      {a.message && !a.error && <p className="text-sm text-ok">{a.message}</p>}
    </div>
  );
}
