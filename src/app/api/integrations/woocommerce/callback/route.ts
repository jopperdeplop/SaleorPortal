import { db } from '@/db';
import { integrations } from '@/db/schema';
import { encrypt } from '@/lib/encryption';

// Debug GET handler to verify the route is accessible
export async function GET(request: Request) {
    return new Response('WooCommerce Callback Endpoint - Use POST for data exchange.', { status: 200 });
}

export async function POST(request: Request) {
    console.log("📥 WooCommerce Callback Request Received");

    try {
        const contentType = request.headers.get('content-type') || '';
        let payload: any;

        if (contentType.includes('application/json')) {
            payload = await request.json();
        } else {
            // Handle form-encoded just in case
            const formData = await request.formData();
            payload = Object.fromEntries(formData.entries());
        }

        console.log("📥 WooCommerce Payload:", JSON.stringify(payload, null, 2));

        const {
            user_id,
            consumer_key,
            consumer_secret,
            store_url,
            key_id
        } = payload;

        if (!consumer_key || !consumer_secret || !store_url) {
            console.error("❌ Missing required fields in WooCommerce payload. Fields received:", Object.keys(payload));
            return new Response('Missing required fields', { status: 400 });
        }

        // --- Security: Encrypt the Secret ---
        const encryptedSecret = encrypt(consumer_secret);

        // --- Database: Save Integration ---
        // user_id comes from our 'auth' route's userId parameter passed to WC
        const userIdInt = parseInt(user_id);
        if (isNaN(userIdInt)) {
            console.error("❌ Invalid user_id received:", user_id);
            return new Response('Invalid user_id', { status: 400 });
        }

        const [newIntegration] = await db.insert(integrations).values({
            userId: userIdInt,
            provider: 'woocommerce',
            storeUrl: store_url.replace(/\/$/, ""),
            accessToken: consumer_key,
            status: 'active',
            settings: {
                consumerSecret: encryptedSecret,
                keyId: key_id,
                wcUserId: user_id,
                sync_inventory: true
            }
        }).returning();

        console.log(`✅ WooCommerce Integration Saved for ${store_url} (ID: ${newIntegration.id})`);

        return new Response('OK', { status: 200 });
    } catch (error: any) {
        console.error("❌ WooCommerce Callback Error:", error.message || error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
