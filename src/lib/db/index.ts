import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

let _db: DbInstance | null = null;

export function getDb(): DbInstance {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL is not set – add it to Netlify environment variables"
      );
    }
    const client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    _db = drizzle(client, { schema }) as DbInstance;
  }
  return _db;
}

// Module-level proxy: safe to import at build time, only fails when actually used
export const db: any = new Proxy({} as any, {
  get(_, prop) {
    return getDb()[prop as keyof DbInstance];
  },
});
