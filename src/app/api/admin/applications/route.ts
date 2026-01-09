import { db } from '@/db';
import { vendorApplications, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { sendInviteEmail, sendRejectionEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const applications = await db
      .select()
      .from(vendorApplications)
      .orderBy(desc(vendorApplications.createdAt));

    return Response.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return new Response('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id, action } = await request.json();

    if (!id || !['approve', 'reject'].includes(action)) {
      return new Response('Invalid request', { status: 400 });
    }

    const results = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, id))
      .limit(1);
    
    const app = results[0];

    if (!app) return new Response('Application not found', { status: 404 });
    if (app.status !== 'pending') return new Response('Application already processed', { status: 400 });

    if (action === 'approve') {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, app.email))
        .limit(1);

      // 1. Generate a secure setup token
      const setupToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // 2. Create/Update the user
      const userData = {
          name: app.companyName,
          email: app.email,
          brand: app.companyName,
          role: 'vendor' as const,
          vatNumber: app.vatNumber,
          legalBusinessName: app.legalBusinessName,
          brandName: app.brandName,
          registrationNumber: app.registrationNumber,
          eoriNumber: app.eoriNumber,
          phoneNumber: app.phoneNumber,
          websiteUrl: app.websiteUrl,
          street: app.street,
          city: app.city,
          postalCode: app.postalCode,
          countryCode: app.countryCode,
          resetToken: setupToken,
          resetTokenExpiry: tokenExpiry,
      };

      if (existingUser.length > 0) {
        // Update existing user
        await db.update(users)
          .set(userData)
          .where(eq(users.id, existingUser[0].id));
      } else {
        // Create the user with a locked state
        const lockedPassword = await hash(crypto.randomBytes(64).toString('hex'), 10);
        await db.insert(users).values({
          ...userData,
          password: lockedPassword,
        });
      }

      // 3. Send the invite email
      await sendInviteEmail(app.email, app.companyName, setupToken);

      await db.update(vendorApplications)
          .set({ status: 'approved', processedAt: new Date() })
          .where(eq(vendorApplications.id, id));

      return Response.json({ message: 'Application approved & invitation sent' });
    } else {
      // Send rejection email
      await sendRejectionEmail(app.email, app.companyName);

      await db.update(vendorApplications)
          .set({ status: 'rejected', processedAt: new Date() })
          .where(eq(vendorApplications.id, id));

      return Response.json({ message: 'Application rejected & notification sent' });
    }
  } catch (error) {
    console.error('Error processing application:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Internal Error: ${errorMessage}`, { status: 500 });
  }
}
