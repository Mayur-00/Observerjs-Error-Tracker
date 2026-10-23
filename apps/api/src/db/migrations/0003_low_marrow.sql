CREATE INDEX "project_ownerId_idx" ON "project" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "error_projectId_idx" ON "error" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "apikey_projectId_idx" ON "apiKey" USING btree ("project_id","isActive");--> statement-breakpoint
ALTER TABLE "error" DROP COLUMN "error_name";--> statement-breakpoint
ALTER TABLE "error" ADD CONSTRAINT "error_error_hash_unique" UNIQUE("error_hash");--> statement-breakpoint
ALTER TABLE "apiKey" ADD CONSTRAINT "apiKey_api_key_unique" UNIQUE("api_key");