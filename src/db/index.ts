import "server-only";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const globalForNeon = globalThis as unknown as { neonPool?: Pool };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required when DATA_MODE=neon.");
  return new Pool({ connectionString, max: 5, idleTimeoutMillis: 20_000, connectionTimeoutMillis: 10_000 });
}

const pool = globalForNeon.neonPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForNeon.neonPool = pool;

export const db = drizzle({ client: pool, schema });
export type Database = typeof db;
