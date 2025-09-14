import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { RegisterSchema, LoginSchema } from "@/schemas";
import { db, users } from "@/db";

export const authApp = new Hono();

authApp.post("/register", zValidator("json", RegisterSchema), async (c) => {
  const { username, password } = c.req.valid("json");
  const hashed = await bcrypt.hash(password, 10);
  await db.insert(users).values({ username, password: hashed });

  return c.json({ success: true });
});

authApp.post("/login", zValidator("json", LoginSchema), async (c) => {
  const { username, password } = c.req.valid("json");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const now = Math.floor(Date.now() / 1000);
  const token = await sign(
    {
      sub: user.id,
      username: user.username,
      iss: "test-icn-todos",
      iat: now,
      exp: now + 60 * 60,
    },
    Bun.env.JWT_SECRET!
  );
  return c.json({ accessToken: token });
});
