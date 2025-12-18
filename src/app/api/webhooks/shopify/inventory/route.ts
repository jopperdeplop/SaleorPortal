import { db } from '@/db';
import { integrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { tasks } from '@trigger.dev/sdk/v3';

export async function POST(request: Request) {
    const shop = request.headers.get('x-shopify-shop-domain');

    if (!shop) {
        return new Response('Missing shop domain', { status: 400 });
    }

    console.log(`📦 Shopify Webhook received for: ${shop}`);

    // Find the integration for this shop
    const integration = await db.query.integrations.findFirst({
        where: eq(integrations.storeUrl, shop)
    });

    if (!integration) {
        console.error(`❌ No integration found for shop: ${shop}`);
        return new Response('Integration not found', { status: 404 });
    }

    // Trigger a Partial Sync for changes in the last 15 minutes
    // (We use a buffer to catch any latency in Shopify's indexing)
    const sinceDate = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const handle = await tasks.trigger("shopify-inventory-sync", {
        integrationId: integration.id,
        since: sinceDate
    });

    console.log(`🚀 Fast Sync triggered! Handle ID: ${handle.id}`);

    return new Response('OK', { status: 200 });
}
