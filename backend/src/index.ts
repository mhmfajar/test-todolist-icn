import { testConnection } from "@/db";
import { authApp, todosApp, swaggerApp } from "@/routes";
import { Hono } from "hono";

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
app.route("/swagger", swaggerApp);

export default app;
