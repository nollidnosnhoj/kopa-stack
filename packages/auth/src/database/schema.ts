import { sql } from "drizzle-orm";
import {
  boolean,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { accountProviders, accountTypes } from "../accounts";

export const authSchema = pgSchema("auth");

export const userTable = authSchema.table("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
});

export const sessionTable = authSchema.table("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const accountTypeProviderEnum = authSchema.enum(
  "account_types",
  accountTypes
);
export const accountProviderEnum = authSchema.enum(
  "account_providers",
  accountProviders
);

export const accountTable = authSchema.table(
  "accounts",
  {
    type: accountTypeProviderEnum("type").notNull(),
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    providerId: accountProviderEnum("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
  },
  (table) => [primaryKey({ columns: [table.providerId, table.providerUserId] })]
);
