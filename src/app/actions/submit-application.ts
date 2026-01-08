'use server';

import { db } from '@/db';
import { vendorApplications } from '@/db/schema';
import { redirect } from 'next/navigation';

/**
 * Handles the submission of a new vendor partner application.
 * Collects comprehensive business, tax, and location data.
 */
export async function submitApplication(formData: FormData) {
    const brandName = formData.get('brandName') as string;
    const legalBusinessName = formData.get('legalBusinessName') as string;
    const email = formData.get('email') as string;
    const vatNumber = formData.get('vatNumber') as string;
    const registrationNumber = formData.get('registrationNumber') as string;
    const eoriNumber = formData.get('eoriNumber') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const websiteUrl = formData.get('websiteUrl') as string;
    
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const zip = formData.get('zip') as string;
    const country = formData.get('country') as string;

    // Validation for critical fields
    if (!brandName || !legalBusinessName || !email || !vatNumber || !country) {
        throw new Error('Missing required fields. Please fill in all mandatory business and tax information.');
    }

    await db.insert(vendorApplications).values({
        companyName: brandName, // Legacy mapping
        brandName,
        legalBusinessName,
        email,
        vatNumber,
        registrationNumber,
        eoriNumber,
        phoneNumber,
        websiteUrl,
        street,
        city,
        postalCode: zip,
        countryCode: country,
        country, // Legacy mapping
        warehouseAddress: { street, city, zip, country }, // Legacy mapping
        status: 'pending',
    });

    redirect('/apply/success');
}
