import type { JWTPayload as HonoJWTPayload } from "hono/utils/jwt/types";

export type JWTPayload = HonoJWTPayload & {
  sub: string;
  username: string;
};
