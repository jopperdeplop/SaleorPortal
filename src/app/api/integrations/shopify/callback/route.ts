import { db } from '@/db';
import { integrations } from '@/db/schema';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');

    if (!code || !shop) {
        return new Response('Missing code or shop parameter', { status: 400 });
    }

    const client_id = process.env.SHOPIFY_CLIENT_ID;
    const client_secret = process.env.SHOPIFY_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id,
            client_secret,
            code,
        }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
        console.error('Shopify Token Error:', tokenData);
        return new Response('Failed to get access token', { status: 500 });
    }

    const accessToken = tokenData.access_token;
    // const userId = 1; // TODO: Get from Session!
    // This is tricky: In a real app, we need to know WHICH user initiated this.
    // Usually we use a 'state' parameter in the Auth URL that contains a signed user ID, or relies on a session cookie.
    // For this MVP, we will assume single-user-session or hardcode ID 1, 
    // BUT to do it right we should check the session cookie present in this callback request.

    // MOCK: Assuming User 1 for now as per plan
    const userId = 1;

    // Save to DB
    const [newIntegration] = await db.insert(integrations).values({
        userId,
        provider: 'shopify',
        storeUrl: shop,
        accessToken: accessToken,
        status: 'active',
    }).returning();

    // --- PHASE 4: Register Real-time Inventory Webhook ---
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

    try {
        console.log(`📡 Registering Inventory Webhook for ${shop}...`);
        await fetch(`https://${shop}/admin/api/2024-04/webhooks.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                webhook: {
                    topic: 'inventory_levels/update',
                    address: `${appUrl}/api/webhooks/shopify/inventory`,
                    format: 'json',
                }
            }),
        });
        console.log(`✅ Inventory Webhook Registered at ${appUrl}/api/webhooks/shopify/inventory`);
    } catch (e) {
        console.error("❌ Failed to register Shopify webhook:", e);
    }

    redirect('/dashboard/integrations?success=true');
}
