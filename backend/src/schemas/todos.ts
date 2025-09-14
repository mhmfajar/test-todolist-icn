import { z } from "zod";
import { PaginationQuerySchema, SoftDeleteQuerySchema } from "./shared";

export const TodoCreateSchema = z.object({
  text: z.string().min(1),
});

export const TodoUpdateSchema = z.object({
  text: z.string().min(1).optional(),
});

export const TodoListQuerySchema = PaginationQuerySchema.extend(
  SoftDeleteQuerySchema.shape
).extend({
  q: z.string().max(100).optional(),
});

export type TodoCreateInput = z.infer<typeof TodoCreateSchema>;
export type TodoUpdateInput = z.infer<typeof TodoUpdateSchema>;
export type TodoListQuery = z.infer<typeof TodoListQuerySchema>;
