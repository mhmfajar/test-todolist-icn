import { suggestionBodySchema } from "@/schemas/shared";
import { generateTaskSuggestions } from "@/utils/openai";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { authMiddleware } from "@/middlewares";
import { responseOk } from "@/utils/response";
import { handleZodValidationResult } from "@/utils/validate";

export const suggestionsApp = new Hono();

suggestionsApp.use(authMiddleware);

suggestionsApp.post(
  "/",
  zValidator("json", suggestionBodySchema, handleZodValidationResult),
  async (c) => {
    const { input, count } = await c.req.json();
    const suggestions = await generateTaskSuggestions(input, count ?? 3);

    return responseOk(c, { data: suggestions });
  }
);
