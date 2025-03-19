ALTER TABLE "mymarket_user" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mymarket_user" ALTER COLUMN "confirmed" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "mymarket_user" ALTER COLUMN "confirmation_code" DROP NOT NULL;