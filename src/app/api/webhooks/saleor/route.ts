import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.SALEOR_WEBHOOK_SECRET;

async function verifySignature(request: Request, body: string) {
	if (!WEBHOOK_SECRET) return true; // Skip if no secret set (not recommended for production)
	
	const signature = request.headers.get("x-saleor-signature");
	if (!signature) return false;

	const expectedSignature = crypto
		.createHmac("sha256", WEBHOOK_SECRET)
		.update(body)
		.digest("hex");

	return signature === expectedSignature;
}

export async function POST(request: Request) {
	const body = await request.text();
	
	// 1. Verify Signature
	if (!(await verifySignature(request, body))) {
		console.error("❌ Invalid Saleor Webhook Signature");
		return new Response("Unauthorized", { status: 401 });
	}

	const event = JSON.parse(body);
	const eventType = request.headers.get("x-saleor-event");

	console.log(`📦 Saleor Webhook received: ${eventType}`);

	// 2. Extract Product Data
	const product = event.product || event; // Saleor sends product object or the whole event is the product
	const productId = product.id;
	
	// Extract brand from metadata
	const metadata = product.metadata || [];
	const brandItem = metadata.find((m: { key: string; value: string }) => m.key === "brand");
	const brand = brandItem?.value;

	if (!productId) {
		console.warn("⚠️ No Product ID found in webhook payload");
		return NextResponse.json({ success: false, error: "No product ID" });
	}

	// 3. Trigger Tasks
	try {
		if (eventType === "product_created") {
			console.log(`✨ New Product Created: ${productId}. Triggering auto-assignment and translation.`);
			
			// 3.1 Auto-assign channels (if brand metadata exists)
			if (brand) {
				await tasks.trigger("auto-assign-product-channels", {
					productId,
					brand
				});
			}

			// 3.2 Trigger translation
			await tasks.trigger("translate-product", { productId });
		} 
		else if (eventType === "product_updated") {
			console.log(`🔄 Product Updated: ${productId}. Triggering translation.`);
			
			// Trigger translation (task is idempotent, will skip if already translated)
			await tasks.trigger("translate-product", { productId });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("❌ Failed to trigger Trigger.dev tasks:", error);
		return NextResponse.json({ success: false, error: "Task trigger failed" }, { status: 500 });
	}
}
