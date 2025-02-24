CREATE TABLE IF NOT EXISTS "mymarket_cart" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"product_id" integer,
	"quantity" integer DEFAULT 1
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_cart" ADD CONSTRAINT "mymarket_cart_user_id_mymarket_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_cart" ADD CONSTRAINT "mymarket_cart_product_id_mymarket_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."mymarket_products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
