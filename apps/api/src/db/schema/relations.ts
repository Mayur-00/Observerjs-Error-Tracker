import { relations } from "drizzle-orm";

import { account, session, user } from "./auth-schema.js";
import { error } from "./error-schema.js";
import { project } from "./project-schema.js";
import { apiKey } from "./apiKey-schema.js";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  projects: many(project),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const projectRelations = relations(project, ({ many, one }) => ({
  owner: one(user, {
    fields: [project.ownerId],
    references: [user.id],
  }),
  errors: many(error),
  apiKeys: many(apiKey),
}));

export const errorRelations = relations(error, ({ one }) => ({
  project: one(project, {
    fields: [error.projectId],
    references: [project.id],
  }),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  project: one(project, {
    fields: [apiKey.projectId],
    references: [project.id],
  }),
}));
