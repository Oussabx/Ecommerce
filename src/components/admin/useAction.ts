"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ActionResult } from "@/server/admin";

/** Run a server action, track pending state, surface errors and refresh on success. */
export function useAction() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const exec = (fn: () => Promise<ActionResult<unknown>>, opts: { onOk?: (r: ActionResult<unknown>) => void; refresh?: boolean } = {}) =>
    new Promise<boolean>((resolve) =>
      start(async () => {
        setError(null);
        setMessage(null);
        const res = await fn();
        if (res.ok) {
          setFields({});
          setMessage(res.message ?? "Saved.");
          opts.onOk?.(res);
          if (opts.refresh !== false) router.refresh();
          resolve(true);
        } else {
          setError(res.error);
          setFields(res.fields ?? {});
          resolve(false);
        }
      }),
    );
  return { exec, pending, error, fields, message, setMessage };
}
