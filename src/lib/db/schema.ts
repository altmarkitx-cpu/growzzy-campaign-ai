import { jsonb, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable("growzzy_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const campaigns = pgTable("growzzy_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id"),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"),
  objective: text("objective").notNull().default(""),
  platform: text("platform").notNull().default(""),
  budgetDaily: numeric("budget_daily").notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const brandProfiles = pgTable("growzzy_brand_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  businessName: text("business_name").notNull().default(""),
  website: text("website").notNull().default(""),
  audience: text("audience").notNull().default(""),
  tone: text("tone").notNull().default(""),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatThreads = pgTable("growzzy_chat_threads", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("New campaign"),
  messages: jsonb("messages").$type<unknown[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
