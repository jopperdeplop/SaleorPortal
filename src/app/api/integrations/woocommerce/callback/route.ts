import { db } from '@/db';
import { integrations } from '@/db/schema';
import { encrypt } from '@/lib/encryption';

// Debug GET handler to verify the route is accessible
export async function GET(request: Request) {
    return new Response('WooCommerce Callback Endpoint - Use POST for data exchange.', { status: 200 });
}

export async function POST(request: Request) {
    console.log("📥 WooCommerce Callback Request Received");
    console.log("Headers:", JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

    try {
        const contentType = request.headers.get('content-type') || '';
        console.log("Content-Type detected:", contentType);

        let payload: any = {};
        const rawBody = await request.text();
        console.log("Raw Body received:", rawBody);

        try {
            payload = JSON.parse(rawBody);
        } catch (e) {
            console.log("Failed to parse as JSON, trying form data...");
            // Manual parse of form data if needed or just use URLSearchParams
            const params = new URLSearchParams(rawBody);
            payload = Object.fromEntries(params.entries());
        }

        console.log("📥 Parsed Payload:", JSON.stringify(payload, null, 2));

        const {
            user_id,
            consumer_key,
            consumer_secret,
            store_url,
            key_id
        } = payload;

        if (!consumer_key || !consumer_secret) {
            console.error("❌ Missing primary keys in WooCommerce payload");
            // Return 200 anyway to prevent WC from showing error if we got SOME data? 
            // Better to return 400 but let's see.
            return new Response('Missing keys', { status: 400 });
        }

        // --- Security: Encrypt the Secret ---
        const encryptedSecret = encrypt(consumer_secret);

        // --- Database: Save Integration ---
        const userIdInt = parseInt(user_id);
        if (isNaN(userIdInt)) {
            console.error("❌ Invalid or missing user_id received:", user_id);
            return new Response('Invalid user_id', { status: 400 });
        }

        const cleanStoreUrl = (store_url || '').replace(/\/$/, "");

        const [newIntegration] = await db.insert(integrations).values({
            userId: userIdInt,
            provider: 'woocommerce',
            storeUrl: cleanStoreUrl,
            accessToken: consumer_key,
            status: 'active',
            settings: {
                consumerSecret: encryptedSecret,
                keyId: key_id,
                wcUserId: user_id,
                sync_inventory: true
            }
        }).returning();

        console.log(`✅ WooCommerce Integration Saved for ${cleanStoreUrl} (ID: ${newIntegration.id})`);

        return new Response('OK', { status: 200 });
    } catch (error: any) {
        console.error("❌ WooCommerce Callback Error:", error.message || error);
        return new Response(`Error: ${error.message}`, { status: 200 }); // Return 200 to help bypass WC strictness during debug
    }
}
