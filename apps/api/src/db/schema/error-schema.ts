import {
  pgEnum,
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { project } from "./project-schema.js";
import { index } from "drizzle-orm/pg-core";

export const errorState = pgEnum("error_state", ["unresolved", "resolved"]);

export const error = pgTable(
  "error",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    errorHash: text("error_hash").notNull(),
    errorType: text("error_type").notNull(),
    message: text("message").notNull(),
    eventCount: integer("event_count").notNull().default(1),
    stack: text("stack").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    filePath: text("file-path").notNull(),
    lastSeen: timestamp("last_seen").defaultNow().notNull(),
    userOs: text("user_Os"),
    userBrowser: text("user_browser"),
    reqPath: text("req-path"),
    reqMethod: text("req-method"),
    device: text("device").notNull(),
    deviceVersion:text('device-version').notNull(),
    platform: text('platform').notNull(),
    platformVersion: text("platform-version").notNull(),
    firstSeen: timestamp("first_seen").defaultNow().notNull(),
    environment: text("environment").notNull(),
    state: errorState("state").notNull().default("unresolved"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("error_projectId_idx").on(table.projectId, table.errorHash),
  ],
);
