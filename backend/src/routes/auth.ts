import config from "@/config";
import { db, refreshTokens, users } from "@/db";
import { LoginSchema, RegisterSchema } from "@/schemas";
import {
  responseFail,
  responseInternalServerError,
  responseOk,
} from "@/utils/response";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { ZodError } from "zod";

import type { DatabaseError } from "pg";

export const authApp = new Hono();

authApp.post(
  "/register",
  zValidator("json", RegisterSchema, (result, c) => {
    if (!result.success) {
      const err = result.error as ZodError;
      console.log(err);
      return responseFail(
        c,
        err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
        400
      );
    }
  }),
  async (c) => {
    const { username, password } = c.req.valid("json");

    try {
      const hashed = await bcrypt.hash(password, 10);
      await db.insert(users).values({ username, password: hashed });

      return responseOk(c, { message: "User registered successfully" }, 201);
    } catch (e) {
      console.error("Registration error:", e);

      const err = (e as any)?.cause as DatabaseError | undefined;

      if (err?.code === "23505")
        return responseFail(c, "Username already taken", 409);

      return responseInternalServerError(c);
    }
  }
);

authApp.post("/login", zValidator("json", LoginSchema), async (c) => {
  const { username, password } = c.req.valid("json");

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) return responseFail(c, "Invalid credentials", 401);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return responseFail(c, "Invalid credentials", 401);

    const now = Math.floor(Date.now() / 1000);

    const accessExp = now + 60 * 15;
    const accessToken = await sign(
      {
        sub: user.id,
        username: user.username,
        iss: "test-icn-todos",
        iat: now,
        exp: accessExp,
      },
      config.JWT_SECRET
    );

    const refreshToken = crypto.randomUUID();
    const refreshExp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExp,
    });

    setCookie(c, "refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "Strict",
    });

    return responseOk(c, {
      accessToken,
      tokenType: "Bearer",
      expiresAt: accessExp,
    });
  } catch (e) {
    console.error("Login error:", e);
    return responseInternalServerError(c);
  }
});

authApp.post("/refresh", async (c) => {
  try {
    const refreshToken = getCookie(c, "refreshToken");
    if (!refreshToken) return responseFail(c, "Missing refresh token", 401);

    const [dbToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .limit(1);

    if (!dbToken || dbToken.revokedAt || dbToken.expiresAt < new Date()) {
      return responseFail(c, "Invalid or expired refresh token", 401);
    }

    const now = Math.floor(Date.now() / 1000);
    const accessExp = now + 60 * 15;

    const newAccessToken = await sign(
      {
        sub: dbToken.userId,
        iss: "test-icn-todos",
        iat: now,
        exp: accessExp,
      },
      config.JWT_SECRET
    );

    const newRefreshToken = crypto.randomUUID();
    const newRefreshExp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, refreshToken));

    await db.insert(refreshTokens).values({
      userId: dbToken.userId,
      token: newRefreshToken,
      expiresAt: newRefreshExp,
    });

    setCookie(c, "refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "Strict",
    });

    return responseOk(c, {
      accessToken: newAccessToken,
      tokenType: "Bearer",
      expiresAt: accessExp,
    });
  } catch (e) {
    console.error("Refresh error:", e);
    return responseInternalServerError(c);
  }
});

authApp.post("/logout", async (c) => {
  try {
    const refreshToken = getCookie(c, "refreshToken");
    if (!refreshToken) {
      return responseFail(c, "Missing refresh token", 400);
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, refreshToken));

    deleteCookie(c, "refreshToken", {
      path: "/",
    });

    return responseOk(c, { message: "Logged out successfully" });
  } catch (e) {
    console.error("Logout error:", e);
    return responseInternalServerError(c);
  }
});
