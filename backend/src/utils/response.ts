import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type {
  InvalidJSONValue,
  JSONValue,
  SimplifyDeepArray,
} from "hono/utils/types";

type JsonLike = JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue;

export function responseOk<T extends JsonLike>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = 200
) {
  return c.json(data, status);
}

export function responseFail<T extends JsonLike>(
  c: Context,
  error: string | T,
  status: ContentfulStatusCode = 400
) {
  return c.json({ error }, status);
}

export function responseInternalServerError(c: Context): Response {
  return c.json({ error: "Internal server error" }, 500);
}
