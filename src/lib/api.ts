"use client";

export interface ApiResult<T = Record<string, unknown>> {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
  data?: T;
}

/** POST/PUT/DELETE JSON to an internal API route with uniform error handling. */
export async function api<T = Record<string, unknown>>(url: string, body?: unknown, method = "POST"): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "Something went wrong. Please try again.", fields: json.fields };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "We couldn't reach the server. Check your connection and try again." };
  }
}
