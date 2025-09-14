import config from "@/config";
import { jwt } from "hono/jwt";

export const authMiddleware = jwt({
  secret: config.JWT_SECRET,
});
