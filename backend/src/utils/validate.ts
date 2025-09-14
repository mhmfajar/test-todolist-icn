import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { responseFail } from "@/utils/response";

export const handleZodValidationResult: Parameters<typeof zValidator>[2] = (
  result,
  c: Context
) => {
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
    return responseFail(c, errors, 400);
  }

  return;
};
