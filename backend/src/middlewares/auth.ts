import { jwt } from "hono/jwt";
import config from "@/config";

export const authMiddleware = jwt({
  secret: config.JWT_SECRET,
});
