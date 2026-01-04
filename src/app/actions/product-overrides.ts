'use server';

import { db } from '@/db';
import { productOverrides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { tasks } from "@trigger.dev/sdk/v3";

export async function updateProductOverride(productId: string, countries: string[]) {
    const session = await auth();
    if (!session?.user?.brand) throw new Error("Unauthorized");

    // 1. Update or Insert Override
    const existing = await db.select().from(productOverrides).where(eq(productOverrides.productId, productId)).limit(1);

    if (existing.length > 0) {
        await db.update(productOverrides)
            .set({ shippingCountries: countries, updatedAt: new Date() })
            .where(eq(productOverrides.productId, productId));
    } else {
        await db.insert(productOverrides)
            .values({ productId, shippingCountries: countries });
    }

    // 2. Trigger Sync Task
    await tasks.trigger("sync-brand-channels", {
        brandName: session.user.brand
    });

    revalidatePath(`/dashboard/products/${productId}`);
}

export async function clearProductOverride(productId: string) {
    const session = await auth();
    if (!session?.user?.brand) throw new Error("Unauthorized");

    await db.delete(productOverrides).where(eq(productOverrides.productId, productId));

    // 2. Trigger Sync Task (will fall back to global settings)
    await tasks.trigger("sync-brand-channels", {
        brandName: session.user.brand
    });

    revalidatePath(`/dashboard/products/${productId}`);
}
