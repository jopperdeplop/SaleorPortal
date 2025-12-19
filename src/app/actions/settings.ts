'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

export async function updateShopSettings(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) throw new Error("Unauthorized");

    const vatNumber = formData.get('vatNumber') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const country = formData.get('country') as string;

    await db.update(users)
        .set({
            vatNumber,
            warehouseAddress: { street, city, zip, country }
        })
        .where(eq(users.id, userId));

    revalidatePath('/dashboard/settings');
}
