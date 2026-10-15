import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * DEMO DATA STORE
 * ---------------
 * A small JSON-file store used until a real database is connected. It writes
 * to DATA_DIR (default ./data) and serialises writes per collection.
 *
 * It is NOT suitable for production or serverless hosting (files are not
 * shared between instances and may be wiped on deploy). Replace the four
 * functions below with database calls — every other server module goes
 * through them.
 */
const DATA_DIR = path.resolve(process.env.DATA_DIR ?? "./data");
const locks = new Map<string, Promise<unknown>>();

async function readFile<T>(name: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8")) as T[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

export async function readAll<T>(name: string): Promise<T[]> {
  await locks.get(name);
  return readFile<T>(name);
}

/** Atomically read-modify-write a collection. */
export async function mutate<T, R>(name: string, fn: (rows: T[]) => R | Promise<R>): Promise<R> {
  const prev = locks.get(name) ?? Promise.resolve();
  let result!: R;
  const next = prev.then(async () => {
    const rows = await readFile<T>(name);
    result = await fn(rows);
    await fs.mkdir(DATA_DIR, { recursive: true });
    const file = path.join(DATA_DIR, `${name}.json`);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), { mode: 0o600 });
    await fs.rename(tmp, file);
  });
  locks.set(name, next.catch(() => undefined));
  await next;
  return result;
}

export async function findOne<T>(name: string, pred: (row: T) => boolean): Promise<T | undefined> {
  return (await readAll<T>(name)).find(pred);
}
