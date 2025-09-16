import { testConnection } from "@/db";
import { authApp, todosApp, swaggerApp, suggestionsApp } from "@/routes";
import { Hono } from "hono";
import { cors } from "hono/cors";

import type { DatabaseError } from "pg";

const app = new Hono();

// Allow CORS for all routes
app.use(
  "/*",
  cors({
    origin: "http://localhost:3000", // frontend origin
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true, // if you want cookies
  })
);

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
