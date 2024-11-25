import {
  boolean,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { oauthProviders } from "../oauth";
import { relations, sql } from "drizzle-orm";

export const authSchema = pgSchema("auth");

export const userTable = authSchema.table("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
});

export const userRelations = relations(userTable, ({ many }) => ({
  sessions: many(sessionTable),
}));

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

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const providerEnum = authSchema.enum(
  "account_providers",
  oauthProviders
);

export const accountTable = authSchema.table(
  "accounts",
  {
    providerUserId: text("provider_user_id").primaryKey(),
    providerId: providerEnum("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
  },
  (table) => [primaryKey({ columns: [table.providerId, table.providerUserId] })]
);

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));
