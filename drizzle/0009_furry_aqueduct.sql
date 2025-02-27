ALTER TABLE "mymarket_products" ADD COLUMN "created_by_id" varchar(255) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_products" ADD CONSTRAINT "mymarket_products_created_by_id_mymarket_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."mymarket_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
