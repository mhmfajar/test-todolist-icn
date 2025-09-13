import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

const auditColumns = () => ({
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  deletedAt: timestamp("deleted_at"),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  deletedBy: uuid("deleted_by"),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    ...auditColumns(),
  },
  (column) => [
    index("users_deleted_at_idx").on(column.deletedAt),

    foreignKey({
      columns: [column.createdBy],
      foreignColumns: [column.id],
      name: "users_created_by_fkey",
    }),
    foreignKey({
      columns: [column.updatedBy],
      foreignColumns: [column.id],
      name: "users_updated_by_fkey",
    }),
    foreignKey({
      columns: [column.deletedBy],
      foreignColumns: [column.id],
      name: "users_deleted_by_fkey",
    }),
  ]
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

    foreignKey({
      columns: [column.createdBy],
      foreignColumns: [users.id],
      name: "todos_created_by_fkey",
    }),
    foreignKey({
      columns: [column.updatedBy],
      foreignColumns: [users.id],
      name: "todos_updated_by_fkey",
    }),
    foreignKey({
      columns: [column.deletedBy],
      foreignColumns: [users.id],
      name: "todos_deleted_by_fkey",
    }),
  ]
);
