ALTER TABLE "error" ALTER COLUMN "device" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "error" ADD COLUMN "device-version" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "error" ADD COLUMN "platform" text NOT NULL;--> statement-breakpoint
ALTER TABLE "error" ADD COLUMN "platform-version" text NOT NULL;