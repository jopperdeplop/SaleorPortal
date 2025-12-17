'use server';

import { tasks } from "@trigger.dev/sdk/v3";
import { revalidatePath } from 'next/cache';
import { db } from "@/db";
import { integrations } from "@/db/schema";

export async function triggerShopifySync(integrationId: number) {
    try {
        console.log(`Triggering Sync for Integration: ${integrationId}`);

        const handle = await tasks.trigger("import-shopify-products", {
            integrationId: integrationId,
            dryRun: false
        });

        console.log(`Task Triggered: ${handle.id}`);
        revalidatePath('/dashboard/integrations');
        return { success: true, handleId: handle.id };
    } catch (error) {
        console.error("Failed to trigger sync:", error);
        return { success: false, error: "Failed to trigger sync" };
    }
}

export async function mockConnect() {
    // Only allow if no active integration exists for this mock user
    // (Optional check, but safe)
    await db.insert(integrations).values({
        userId: 1, // Mock user
        provider: "shopify",
        storeUrl: "test-store.myshopify.com",
        accessToken: "mock_token_123",
        status: "active"
    });
    revalidatePath('/dashboard/integrations');
}
