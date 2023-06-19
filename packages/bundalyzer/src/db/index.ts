import { type BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { type DatabaseSchema } from "./schema";

export type AppDatabase = BaseSQLiteDatabase<
  "async",
  {
    changes: number;
    lastInsertRowid: number | bigint;
  },
  DatabaseSchema
>;

let _db!: AppDatabase;

export function getDB() {
  if (!_db) {
    throw new Error("DB not set");
  }
  return _db;
}

export async function initializeDbIfNeeded(
  factory: () => Promise<AppDatabase>
) {
  if (!_db) {
    _db = await factory();
  }
}
