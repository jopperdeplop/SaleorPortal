CREATE TABLE "product_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"shipping_countries" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_overrides_product_id_unique" UNIQUE("product_id")
);
--> statement-breakpoint
CREATE TABLE "saleor_auth" (
	"saleor_api_url" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"app_id" text NOT NULL,
	"jwks" text
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "legal_business_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "brand_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "registration_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "saleor_page_slug" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "eori_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "geocoded_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "shipping_countries" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token_expiry" timestamp;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "legal_business_name" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "brand_name" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "registration_number" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "eori_number" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "phone_number" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "vendor_applications" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "warehouse_address";--> statement-breakpoint
ALTER TABLE "vendor_applications" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "vendor_applications" DROP COLUMN "warehouse_address";