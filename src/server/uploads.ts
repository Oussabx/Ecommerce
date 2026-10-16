import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Store an uploaded product image and return its public URL.
 * Production: Vercel Blob (set BLOB_READ_WRITE_TOKEN). Development without a
 * token: written to public/uploads so it works locally.
 */
export async function storeImage(file: File, prefix: string): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Upload a JPEG, PNG, WebP or AVIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5 MB or smaller.");
  const safe = prefix.replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "product";
  const name = `products/${safe}/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type, addRandomSuffix: false });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Image storage isn't configured. Connect Vercel Blob (BLOB_READ_WRITE_TOKEN) to upload images.");
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
