"use client";
import { useState } from "react";
import { adjustStock } from "@/app/admin/inventory/actions";
import { useAction } from "./useAction";

const REASONS = ["Delivery received", "Stock count correction", "Damaged / faulty", "Returned by customer", "Reserved in store"];

export function StockAdjuster({ productId, name }: { productId: string; name: string }) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const a = useAction();
  return (
    <form
      className="flex flex-wrap items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        a.exec(() => adjustStock({ productId, delta, reason }), { onOk: () => setDelta("") });
      }}
    >
      <input value={delta} onChange={(e) => setDelta(e.target.value)} inputMode="numeric" placeholder="+5 / −2" className="field !min-h-9 w-20 !py-1 text-sm" aria-label={`Change in stock for ${name}`} />
      <input list="stock-reasons" value={reason} onChange={(e) => setReason(e.target.value)} className="field !min-h-9 w-44 !py-1 text-sm" aria-label="Reason" />
      <button disabled={a.pending || !delta} className="btn btn-outline !min-h-9 !px-3 text-xs">
        Apply
      </button>
      <datalist id="stock-reasons">
        {REASONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      {a.error && <span className="w-full text-xs text-danger">{a.error}</span>}
      {a.message && !a.error && <span className="label w-full text-ok">{a.message}</span>}
    </form>
  );
}
