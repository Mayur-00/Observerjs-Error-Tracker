ALTER TABLE "error" RENAME COLUMN "user_agent" TO "user_Os";--> statement-breakpoint
ALTER TABLE "error" ADD COLUMN "user_browser" text;