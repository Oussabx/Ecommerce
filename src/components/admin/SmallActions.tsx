"use client";
import { removeSubscriber, setHandled } from "@/app/admin/messages/actions";
import { useAction } from "./useAction";

export function HandledToggle({ id, handled }: { id: string; handled: boolean }) {
  const a = useAction();
  return (
    <button type="button" disabled={a.pending} onClick={() => a.exec(() => setHandled(id, !handled))} className={handled ? "label text-muted hover:text-ink" : "btn btn-primary !min-h-9 !px-3 text-xs"}>
      {handled ? "Reopen" : "Mark handled"}
    </button>
  );
}

export function RemoveSubscriber({ email }: { email: string }) {
  const a = useAction();
  return (
    <button type="button" disabled={a.pending} onClick={() => confirm(`Remove ${email} from the newsletter list?`) && a.exec(() => removeSubscriber(email))} className="label text-muted hover:text-danger">
      Remove
    </button>
  );
}
