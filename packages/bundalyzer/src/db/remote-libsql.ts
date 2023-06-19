import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { type AppDatabase } from ".";

export function connectRemoteLibsSqlDB(opts: {
  url: string;
  authToken: string;
}) {
  const client = createClient({
    url: opts.url,
    authToken: opts.authToken,
  });
  const db = drizzle(client);
  return db as any as AppDatabase;
}
