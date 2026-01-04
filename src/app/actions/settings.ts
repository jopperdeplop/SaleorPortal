'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

import { tasks } from "@trigger.dev/sdk/v3";

export async function updateShopSettings(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) throw new Error("Unauthorized");

    const vatNumber = formData.get('vatNumber') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const country = formData.get('country') as string;
    
    // Extract multi-select countries
    const shippingCountries = formData.getAll('shippingCountries') as string[];

    const updatedUser = await db.update(users)
        .set({
            vatNumber,
            warehouseAddress: { street, city, zip, country },
            shippingCountries: shippingCountries
        })
        .where(eq(users.id, userId))
        .returning({ brand: users.brand });

    // Trigger Sync Task
    if (updatedUser[0]?.brand) {
        await tasks.trigger("sync-brand-channels", {
            brandName: updatedUser[0].brand
        });
    }

    revalidatePath('/dashboard/settings');
}
