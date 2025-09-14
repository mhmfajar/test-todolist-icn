import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import {
  TodoCreateSchema,
  TodoListQuerySchema,
  TodoUpdateSchema,
} from "@/schemas";
import { authMiddleware } from "@/middlewares";
import { db, todos } from "@/db";

import type { JWTPayload } from "@/types/jwt";

export const todosApp = new Hono();

todosApp.use(authMiddleware);

// list
todosApp.get("/", zValidator("query", TodoListQuerySchema), async (c) => {
  const qp = c.req.valid("query");
  const { sub: userId }: JWTPayload = c.get("jwtPayload");

  const parsed = z.uuid().safeParse(userId);
  if (!parsed.success) {
    return c.json({ page: qp.page, limit: qp.limit, data: [] });
  }

  const conditions = [eq(todos.userId, parsed.data)];
  if (!qp.includeDeleted) conditions.push(isNull(todos.deletedAt));

  try {
    const base = db.select().from(todos);
    const query = conditions.length ? base.where(and(...conditions)) : base;

    const data = await query.limit(qp.limit).offset((qp.page - 1) * qp.limit);

    return c.json({ page: qp.page, limit: qp.limit, data });
  } catch (error: unknown) {
    const code =
      (error as { code?: string })?.code ??
      (error as { cause?: { code?: string } })?.cause?.code;

    if (code === "22P02") {
      return c.json({ page: qp.page, limit: qp.limit, data: [] });
    }

    throw error;
  }
});

// create
todosApp.post("/", zValidator("json", TodoCreateSchema), async (c) => {
  const { sub: userId }: JWTPayload = c.get("jwtPayload");
  const body = c.req.valid("json");
  const [row] = await db
    .insert(todos)
    .values({
      userId,
      text: body.text,
      createdBy: userId,
    })
    .returning();

  return c.json(row, 201);
});

// update
todosApp.put("/:id", zValidator("json", TodoUpdateSchema), async (c) => {
  const { sub: userId }: JWTPayload = c.get("jwtPayload");
  const id = c.req.param("id");
  const body = await c.req.json();
  const [updated] = await db
    .update(todos)
    .set(body)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// delete
todosApp.delete("/:id", async (c) => {
  const { sub: userId }: JWTPayload = c.get("jwtPayload");
  const id = c.req.param("id");
  const [deletedRow] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!deletedRow) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});
