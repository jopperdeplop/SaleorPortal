import { db } from '@/db';
import { integrations } from '@/db/schema';
import { encrypt } from '@/lib/encryption';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log("📥 WooCommerce Callback Payload Received:", JSON.stringify(payload, null, 2));

        const {
            user_id,
            consumer_key,
            consumer_secret,
            store_url,
            key_id
        } = payload;

        if (!consumer_key || !consumer_secret || !store_url) {
            console.error("❌ Missing required fields in WooCommerce payload");
            return new Response('Missing required fields', { status: 400 });
        }

        // --- Security: Encrypt the Secret ---
        const encryptedSecret = encrypt(consumer_secret);

        // --- Database: Save Integration ---
        const userId = parseInt(user_id);

        const [newIntegration] = await db.insert(integrations).values({
            userId: userId,
            provider: 'woocommerce',
            storeUrl: store_url.replace(/\/$/, ""),
            accessToken: consumer_key, // We store key here, secret in settings
            status: 'active',
            settings: {
                consumerSecret: encryptedSecret,
                keyId: key_id,
                wcUserId: user_id,
                sync_inventory: true
            }
        }).returning();

        console.log(`✅ WooCommerce Integration Saved for ${store_url} (ID: ${newIntegration.id})`);

        // --- PHASE 4: Register Webhooks (Async or Triggered later) ---
        // For now, we return 200 to WooCommerce to confirm receipt.

        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error("❌ WooCommerce Callback Error:", error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
