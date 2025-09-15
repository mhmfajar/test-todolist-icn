import { db, todos } from "@/db";
import { authMiddleware } from "@/middlewares";
import {
  TodoCreateSchema,
  TodoListQuerySchema,
  TodoUpdateSchema,
} from "@/schemas";
import { handleZodValidationResult } from "@/utils/validate";
import { zValidator } from "@hono/zod-validator";
import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { JWTPayload } from "@/types/jwt";
import {
  responseFail,
  responseInternalServerError,
  responseOk,
} from "@/utils/response";

export const todosApp = new Hono();

todosApp.use(authMiddleware);

// LIST
todosApp.get(
  "/",
  zValidator("query", TodoListQuerySchema, handleZodValidationResult),
  async (c) => {
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
  }
);

// CREATE
todosApp.post(
  "/",
  zValidator("json", TodoCreateSchema, handleZodValidationResult),
  async (c) => {
    const { sub: userId }: JWTPayload = c.get("jwtPayload");
    const parsed = z.uuid().safeParse(userId);
    if (!parsed.success) {
      return responseFail(c, "Unauthorized", 401);
    }

    try {
      const body = c.req.valid("json");

      const [row] = await db
        .insert(todos)
        .values({
          userId: parsed.data,
          text: body.text,
        })
        .returning();

      return c.json(row, 201);
    } catch (e) {
      console.error("Create todo error:", e);
      const code =
        (e as { code?: string })?.code ??
        (e as { cause?: { code?: string } })?.cause?.code;

      if (code === "23503")
        return responseFail(c, "Related record missing", 409);

      return responseInternalServerError(c);
    }
  }
);

// UPDATE
todosApp.put(
  "/:id",
  zValidator("json", TodoUpdateSchema, handleZodValidationResult),
  async (c) => {
    const { sub: userId }: JWTPayload = c.get("jwtPayload");
    const parsedUser = z.uuid().safeParse(userId);
    if (!parsedUser.success) {
      return responseFail(c, "Unauthorized", 401);
    }

    const id = c.req.param("id");
    const parsedId = z.uuid().safeParse(id);
    if (!parsedId.success) {
      return responseFail(c, "Invalid todo id", 400);
    }

    try {
      const body = c.req.valid("json");

      const [updated] = await db
        .update(todos)
        .set(body)
        .where(
          and(eq(todos.id, parsedId.data), eq(todos.userId, parsedUser.data))
        )
        .returning();

      if (!updated) return responseFail(c, "Not found", 404);
      return responseOk(c, updated);
    } catch (e) {
      console.error("Update todo error:", e);
      const code =
        (e as { code?: string })?.code ??
        (e as { cause?: { code?: string } })?.cause?.code;

      if (code === "22P02") return responseFail(c, "Invalid input syntax", 400);
      if (code === "23503")
        return responseFail(c, "Related record missing", 409);
      if (code === "23505") return responseFail(c, "Conflict", 409);

      return responseInternalServerError(c);
    }
  }
);

// DELETE
todosApp.delete("/:id", async (c) => {
  const { sub: userId }: JWTPayload = c.get("jwtPayload");
  const parsedUser = z.uuid().safeParse(userId);
  if (!parsedUser.success) {
    return responseFail(c, "Unauthorized", 401);
  }

  const id = c.req.param("id");
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) {
    return responseFail(c, "Invalid todo id", 400);
  }

  try {
    const [deletedRow] = await db
      .delete(todos)
      .where(
        and(eq(todos.id, parsedId.data), eq(todos.userId, parsedUser.data))
      )
      .returning();

    if (!deletedRow) return responseFail(c, "Not found", 404);
    return responseOk(c, { success: true });
  } catch (e) {
    console.error("Delete todo error:", e);
    const code =
      (e as { code?: string })?.code ??
      (e as { cause?: { code?: string } })?.cause?.code;

    if (code === "22P02") return responseFail(c, "Invalid input syntax", 400);
    if (code === "23503")
      return responseFail(c, "Cannot delete due to reference", 409);

    return responseInternalServerError(c);
  }
});
