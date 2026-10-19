import { pgEnum, pgTable, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { project } from "./project-schema.js";

export const errorState = pgEnum("error_state", ["unresolved", "resolved"]);

export const error = pgTable("error", {
  id: uuid("id").primaryKey().defaultRandom(),
  errorHash: text("error_hash").notNull(),
  errorName: text("error_name").notNull(),
  errorType: text("error_type").notNull(),
  message: text("message").notNull(),
  eventCount: integer("event_count").notNull().default(1),
  stack: text("stack").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  location: text("location").notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  userAgent: text("user_agent"),
  device: text("device"),
  firstSeen: timestamp("first_seen").defaultNow().notNull(),
  environment: text("environment").notNull(),
  state: errorState("state").notNull().default("unresolved"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
