'use server';

import { tasks } from "@trigger.dev/sdk/v3";
import { revalidatePath } from 'next/cache';
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

export async function triggerIntegrationSync(integrationId: number, provider: string) {
    try {
        console.log(`Triggering ${provider} Sync for Integration: ${integrationId}`);

        const taskId = provider === 'shopify' ? 'shopify-product-sync' : 'woocommerce-product-sync';

        const handle = await tasks.trigger(taskId, {
            integrationId: integrationId,
            dryRun: false
        });

        console.log(`Task [${taskId}] Triggered: ${handle.id}`);
        revalidatePath('/dashboard/integrations');
        return { success: true, handleId: handle.id };
    } catch (error) {
        console.error(`Failed to trigger ${provider} sync:`, error);
        return { success: false, error: `Failed to trigger ${provider} sync` };
    }
}

export async function disconnectIntegration(integrationId: number) {
    try {
        await db.delete(integrations).where(eq(integrations.id, integrationId));
        revalidatePath('/dashboard/integrations');
        return { success: true };
    } catch (error) {
        console.error("Failed to disconnect:", error);
        return { success: false, error: "Failed to disconnect" };
    }
}
