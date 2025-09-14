import { Hono } from "hono";
import { testConnection } from "@/db";
import { authApp, todosApp } from "@/routes";

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
  return c.json({ message: "Welcome!" });
});
app.route("/auth", authApp);
app.route("/todos", todosApp);

export default app;
