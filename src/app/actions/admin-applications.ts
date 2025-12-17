'use server';

import { db } from '@/db';
import { vendorApplications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function approveApplication(applicationId: number) {
    // 1. Fetch Application
    const app = await db.query.vendorApplications.findFirst({
        where: eq(vendorApplications.id, applicationId)
    });

    if (!app) throw new Error("Application not found");
    if (app.status !== 'pending') throw new Error("Application already processed");

    // 2. Create User
    // Generate a random password (in production, send email reset link instead)
    const tempPassword = 'password123'; // Hardcoded for easier testing
    console.log("---------------------------------------------------");
    console.log(`APPROVAL SUCCESS: User '${app.companyName}' created.`);
    console.log(`TEMPORARY PASSWORD: ${tempPassword}`);
    console.log("---------------------------------------------------");

    const hashedPassword = await hash(tempPassword, 10);

    await db.insert(users).values({
        name: app.companyName,
        email: app.email,
        password: hashedPassword,
        brand: app.companyName,
        role: 'vendor',
        vatNumber: app.vatNumber,
        warehouseAddress: app.warehouseAddress,
    });

    // 3. Update Application Status
    await db.update(vendorApplications)
        .set({ status: 'approved', processedAt: new Date() })
        .where(eq(vendorApplications.id, applicationId));

    // 4. (TODO) Send Email via Resend/SMTP with `tempPassword`

    revalidatePath('/admin/applications');
}


export async function rejectApplication(applicationId: number) {
    await db.update(vendorApplications)
        .set({ status: 'rejected', processedAt: new Date() })
        .where(eq(vendorApplications.id, applicationId));

    revalidatePath('/admin/applications');
}
