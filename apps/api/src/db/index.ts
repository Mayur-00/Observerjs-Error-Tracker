import "dotenv/config"
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from "./schema/index.js";

// Custom configuration for connection thresholds
export const dbpool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                  // Prevents crashing your DB under high API traffic
  idleTimeoutMillis: 30000, // Releases unused connections
  connectionTimeoutMillis: 5000,
});

export const db = drizzle({ client: dbpool, schema });
export type DB = NodePgDatabase<typeof schema>;
