'use server';

import { tasks } from "@trigger.dev/sdk/v3";
import { revalidatePath } from 'next/cache';
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

export async function triggerShopifySync(integrationId: number) {
    try {
        console.log(`Triggering Sync for Integration: ${integrationId}`);

        const handle = await tasks.trigger("shopify-product-sync", {
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
    const webhookSecret = "mock_shopify_secret_123"; // In reality, this comes from Shopify App Setup
    const encryptedSecret = encrypt(webhookSecret);

    await db.insert(integrations).values({
        userId: 1, // Mock user
        provider: "shopify",
        storeUrl: "test-store.myshopify.com",
        accessToken: "mock_token_123",
        status: "active",
        settings: {
            webhookSecret: encryptedSecret,
            sync_inventory: true
        }
    });
    revalidatePath('/dashboard/integrations');
}

export async function disconnectShopify(integrationId: number) {
    try {
        await db.delete(integrations).where(eq(integrations.id, integrationId));
        revalidatePath('/dashboard/integrations');
        return { success: true };
    } catch (error) {
        console.error("Failed to disconnect:", error);
        return { success: false, error: "Failed to disconnect" };
    }
}
