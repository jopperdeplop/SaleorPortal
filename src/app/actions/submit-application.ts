'use server';

import { db } from '@/db';
import { vendorApplications } from '@/db/schema';
import { redirect } from 'next/navigation';

export async function submitApplication(formData: FormData) {
    const companyName = formData.get('companyName') as string;
    const email = formData.get('email') as string;
    const vatNumber = formData.get('vatNumber') as string;
    const country = formData.get('country') as string;

    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;

    if (!companyName || !email || !vatNumber || !country) {
        throw new Error('Missing required fields');
    }

    await db.insert(vendorApplications).values({
        companyName,
        email,
        vatNumber,
        country,
        warehouseAddress: { street, city, zip, country },
        status: 'pending',
    });

    redirect('/apply/success');
}
