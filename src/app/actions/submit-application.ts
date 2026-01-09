'use server';

import { db } from '@/db';
import { vendorApplications } from '@/db/schema';
import { redirect } from 'next/navigation';
import { sendApplicationReceivedEmail } from '@/lib/mail';

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

    // Check for duplicates in both users and vendorApplications
    const existingEmail = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email)
    });
    if (existingEmail) throw new Error('A user with this email address already exists.');

    const existingEmailApp = await db.query.vendorApplications.findFirst({
        where: (apps, { eq, and, ne }) => and(eq(apps.email, email), ne(apps.status, 'rejected'))
    });
    if (existingEmailApp) throw new Error('An application with this email address is already in progress.');

    const existingBrand = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.brandName, brandName)
    });
    if (existingBrand) throw new Error('This brand name is already registered.');

    const existingLegal = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.legalBusinessName, legalBusinessName)
    });
    if (existingLegal) throw new Error('This legal business name is already registered.');

    const existingVat = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.vatNumber, vatNumber)
    });
    if (existingVat) throw new Error('This VAT number is already associated with an account.');

    const existingVatApp = await db.query.vendorApplications.findFirst({
        where: (apps, { eq, and, ne }) => and(eq(apps.vatNumber, vatNumber), ne(apps.status, 'rejected'))
    });
    if (existingVatApp) throw new Error('An application with this VAT number is already in progress.');

    const existingReg = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.registrationNumber, registrationNumber)
    });
    if (existingReg && registrationNumber) throw new Error('This registration number is already associated with an account.');

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
        status: 'pending',
    });

    try {
        await sendApplicationReceivedEmail(email, brandName);
    } catch (error) {
        console.error('Failed to send application confirmation email:', error);
        // Continue even if email fails - user feedback on success page is enough
    }

    redirect('/apply/success');
}
