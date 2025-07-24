ALTER TABLE "mymarket_user" ADD COLUMN "username" varchar;--> statement-breakpoint
ALTER TABLE "mymarket_user" ADD CONSTRAINT "mymarket_user_username_unique" UNIQUE("username");