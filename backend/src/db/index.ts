import { drizzle } from "drizzle-orm/node-postgres";
import config from "@/config";
import * as schema from "./schema";
import { Pool } from "pg";

import type { DatabaseError } from "pg";

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

export const testConnection = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.execute("select 1")
      .then(() => resolve(true))
      .catch((err: DatabaseError) => reject(err));
  });
};
