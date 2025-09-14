import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const auditColumns = () => ({
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    ...auditColumns(),
  },
  (column) => [index("users_deleted_at_idx").on(column.deletedAt)]
);

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...auditColumns(),
  },
  (column) => [index("refresh_tokens_user_id_idx").on(column.userId)]
);

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    text: text("text").notNull(),
    ...auditColumns(),
  },
  (column) => [
    index("todos_user_id_idx").on(column.userId),
    index("todos_deleted_at_idx").on(column.deletedAt),
  ]
);
