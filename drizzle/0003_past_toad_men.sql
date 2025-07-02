ALTER TABLE "mymarket_account" DROP CONSTRAINT "mymarket_account_user_id_mymarket_user_id_fk";
--> statement-breakpoint
ALTER TABLE "mymarket_conversations" DROP CONSTRAINT "mymarket_conversations_buyer_id_mymarket_user_id_fk";
--> statement-breakpoint
ALTER TABLE "mymarket_conversations" DROP CONSTRAINT "mymarket_conversations_seller_id_mymarket_user_id_fk";
--> statement-breakpoint
ALTER TABLE "mymarket_messages" DROP CONSTRAINT "mymarket_messages_conversation_id_mymarket_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "mymarket_messages" DROP CONSTRAINT "mymarket_messages_sender_id_mymarket_user_id_fk";
--> statement-breakpoint
ALTER TABLE "mymarket_products" DROP CONSTRAINT "mymarket_products_created_by_id_mymarket_user_id_fk";
--> statement-breakpoint
ALTER TABLE "mymarket_session" DROP CONSTRAINT "mymarket_session_user_id_mymarket_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_account" ADD CONSTRAINT "mymarket_account_user_id_mymarket_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_conversations" ADD CONSTRAINT "mymarket_conversations_buyer_id_mymarket_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_conversations" ADD CONSTRAINT "mymarket_conversations_seller_id_mymarket_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_messages" ADD CONSTRAINT "mymarket_messages_conversation_id_mymarket_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."mymarket_conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_messages" ADD CONSTRAINT "mymarket_messages_sender_id_mymarket_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_products" ADD CONSTRAINT "mymarket_products_created_by_id_mymarket_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "mymarket_session" ADD CONSTRAINT "mymarket_session_user_id_mymarket_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."mymarket_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
