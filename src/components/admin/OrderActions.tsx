"use client";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import { addOrderNote, changeStatus, setDeliveryFee } from "@/app/admin/orders/actions";
import { TRANSITIONS, transitionLabel } from "@/lib/order-status";
import { FormError } from "@/components/ui/Field";
import { useAction } from "./useAction";
import { cn } from "@/lib/format";

export function OrderActions({ orderRef, status, fee }: { orderRef: string; status: OrderStatus; fee: number | null }) {
  const statusA = useAction();
  const feeA = useAction();
  const noteA = useAction();
  const [note, setNote] = useState("");
  const [feeValue, setFeeValue] = useState(fee === null ? "" : String(fee));
  const [comment, setComment] = useState("");
  const next = TRANSITIONS[status];
  const closed = next.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="label mb-2">Update status</h3>
        {closed ? (
          <p className="text-sm text-muted">This order is closed.</p>
        ) : (
          <>
            <label htmlFor="status-note" className="sr-only">
              Note for this change
            </label>
            <input id="status-note" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional note, e.g. “Confirmed with customer, delivery Thursday”" className="field mb-2 text-sm" />
            <div className="flex flex-wrap gap-2">
              {next.map((to) => (
                <button
                  key={to}
                  type="button"
                  disabled={statusA.pending}
                  onClick={() => {
                    if (to === "CANCELLED" && !confirm("Cancel this order? Reserved stock goes back into inventory.")) return;
                    statusA.exec(() => changeStatus(orderRef, to, comment), { onOk: () => setComment("") });
                  }}
                  className={cn("btn !min-h-10 text-xs", to === "CANCELLED" ? "border-danger text-danger hover:bg-danger hover:text-paper" : "btn-primary")}
                >
                  {transitionLabel[to]}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="mt-2">
          <FormError message={statusA.error} />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          feeA.exec(() => setDeliveryFee(orderRef, feeValue));
        }}
      >
        <label htmlFor="fee" className="label mb-2 block">
          Delivery fee (USD)
        </label>
        <div className="flex gap-2">
          <input id="fee" inputMode="decimal" value={feeValue} onChange={(e) => setFeeValue(e.target.value)} placeholder="Agreed with the customer" disabled={closed} className="field text-sm" aria-invalid={!!feeA.error} />
          <button disabled={feeA.pending || closed} className="btn btn-outline !min-h-12 shrink-0 text-xs">
            Save fee
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Leave empty while the fee is still to be confirmed by phone.</p>
        {feeA.error ? <p className="mt-1 text-sm text-danger">{feeA.error}</p> : feeA.message && <p className="label mt-1 text-ok">{feeA.message}</p>}
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          noteA.exec(() => addOrderNote(orderRef, note), { onOk: () => setNote("") });
        }}
      >
        <label htmlFor="note" className="label mb-2 block">
          Internal note
        </label>
        <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="field min-h-20 text-sm" placeholder="Visible to staff only" />
        <button disabled={noteA.pending} className="btn btn-outline mt-2 !min-h-10 text-xs">
          Add note
        </button>
        {noteA.error && <p className="mt-1 text-sm text-danger">{noteA.error}</p>}
      </form>
    </div>
  );
}
