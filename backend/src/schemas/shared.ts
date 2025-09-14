import { z } from "zod";

export const IdParamSchema = z.object({
  id: z.uuid(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const SoftDeleteQuerySchema = z.object({
  includeDeleted: z.coerce.boolean().default(false),
});

export const ServerAudit = z.object({
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  deletedBy: z.string().optional(),
});

export const suggestionBodySchema = z.object({
  input: z.string().min(1, "input is required"),
  count: z.coerce.number().int().min(1).max(5).optional(),
});

export type SuggestionBody = z.infer<typeof suggestionBodySchema>;
