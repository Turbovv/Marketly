ALTER TABLE "mymarket_cart" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "mymarket_cart" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "mymarket_cart" ADD COLUMN "price" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "mymarket_cart" ADD COLUMN "desc" varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE "mymarket_cart" ADD COLUMN "url" varchar(500) NOT NULL;