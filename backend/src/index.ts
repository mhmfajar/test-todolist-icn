import { testConnection } from "@/db";
import { authApp, todosApp, swaggerApp, suggestionsApp } from "@/routes";
import { Hono } from "hono";

import type { DatabaseError } from "pg";
import config from "./config";

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
app.route("/suggestions", suggestionsApp);

export default app;
