import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

import { project } from "./project-schema.js";

export const apiKey = pgTable("apiKey", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiKey: text("api_key").notNull(),
  apiKeyPreview: text("api_key_preview").notNull(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
