DROP INDEX "error_projectId_idx";--> statement-breakpoint
ALTER TABLE "error" ADD COLUMN "req-path" text;--> statement-breakpoint
CREATE INDEX "error_projectId_idx" ON "error" USING btree ("project_id","error_hash");