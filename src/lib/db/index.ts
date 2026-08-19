import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { growzzyPool?: Pool };
export const pool = globalForDb.growzzyPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.growzzyPool = pool;
export const db = drizzle(pool, { schema });
