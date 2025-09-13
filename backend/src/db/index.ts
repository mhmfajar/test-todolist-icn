import { drizzle } from "drizzle-orm/node-postgres";
import config from "@/config";

import type { DatabaseError } from "pg";

const db = drizzle(config.DATABASE_URL);

export const testConnection = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.execute("select 1")
      .then(() => resolve(true))
      .catch((err: DatabaseError) => reject(err));
  });
};
