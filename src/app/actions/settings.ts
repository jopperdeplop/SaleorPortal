'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import { tasks } from "@trigger.dev/sdk/v3";

/**
 * Updates vendor shop settings, including business identity, tax info, and location.
 * Triggers background tasks for geocoding (if address changes) and brand channel synchronization.
 */
export async function updateShopSettings(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) throw new Error("Unauthorized");

    // Extract basic business info
    const brandName = formData.get('brandName') as string;
    const legalBusinessName = formData.get('legalBusinessName') as string;
    const vatNumber = formData.get('vatNumber') as string;
    const registrationNumber = formData.get('registrationNumber') as string;
    const eoriNumber = formData.get('eoriNumber') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const websiteUrl = formData.get('websiteUrl') as string;

    // Extract warehouse location
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const country = formData.get('country') as string;
    
    // Extract multi-select countries for shipping
    const shippingCountries = formData.getAll('shippingCountries') as string[];

    // Fetch current state to detect address changes
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            street: true,
            city: true,
            postalCode: true,
            countryCode: true,
            brand: true,
            id: true
        }
    });

    const isAddressDirty = currentUser?.street !== street || 
                          currentUser?.city !== city || 
                          currentUser?.postalCode !== zip || 
                          currentUser?.countryCode !== country;

    const updatedUser = await db.update(users)
        .set({
            brandName,
            legalBusinessName,
            vatNumber,
            registrationNumber,
            eoriNumber,
            phoneNumber,
            websiteUrl,
            street,
            city,
            postalCode: zip,
            countryCode: country,
            shippingCountries: shippingCountries
        })
        .where(eq(users.id, userId))
        .returning({ brand: users.brand, id: users.id });

    // Trigger Geocoding task if the address was modified
    if (isAddressDirty && updatedUser[0]?.id) {
        console.log(`🚀 Address changed. Triggering geocode-vendor-address for user: ${updatedUser[0].id}`);
        try {
            await tasks.trigger("geocode-vendor-address", { userId: updatedUser[0].id });
        } catch (err) {
            console.error("❌ Failed to trigger geocoding:", err);
        }
    }

    // Trigger Brand Sync Task (Legacy)
    const brandToSync = updatedUser[0]?.brand || brandName;
    if (brandToSync) {
        console.log(`🚀 Triggering sync-brand-channels for brand: ${brandToSync}`);
        try {
            await tasks.trigger("sync-brand-channels", {
                brandName: brandToSync
            });
            console.log("✅ Sync Triggered successfully");
        } catch (e) {
            console.error("❌ Failed to trigger sync-brand-channels:", e);
        }
    }

    revalidatePath('/dashboard/settings');
    redirect('/dashboard/settings?success=true');
}
