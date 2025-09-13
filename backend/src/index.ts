import { Hono } from "hono";
import { testConnection } from "./db";

import type { DatabaseError } from "pg";

const app = new Hono();

testConnection()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err: DatabaseError) => {
    console.error("Database connection error:", err);
  });

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
