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
      console.log(`Processing approval for application ID: ${id}`);
      
      // 1. Check for conflicts in the users table
      const existingEmail = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, app.email)
      });
      if (existingEmail) {
        console.warn(`Approval conflict: User with email ${app.email} already exists.`);
        return new Response('Conflict: A user with this email address already exists in the system.', { status: 409 });
      }

      const existingBrand = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.brandName, app.brandName || app.companyName)
      });
      if (existingBrand) {
        console.warn(`Approval conflict: Brand ${app.brandName || app.companyName} already exists.`);
        return new Response('Conflict: A brand with this name is already registered.', { status: 409 });
      }

      // 2. Generate a secure setup token
      const setupToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // 3. Create the user with a locked state
      const lockedPassword = await hash(crypto.randomBytes(64).toString('hex'), 10);
      
      console.log(`Creating vendor user for ${app.email}...`);
      const [newUser] = await db.insert(users).values({
          name: app.companyName,
          email: app.email,
          password: lockedPassword,
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
      }).returning();
      console.log(`User created with ID: ${newUser.id}`);

      // 4. Trigger geocoding task (saleor-app-template)
      try {
        console.log(`Triggering geocoding for user ${newUser.id}...`);
        const { tasks } = await import('@trigger.dev/sdk');
        await tasks.trigger("geocode-vendor-address", { userId: newUser.id });
        console.log('Geocoding task triggered successfully.');
      } catch (error) {
        console.error('Failed to trigger geocoding task:', error);
      }

      // 5. Send the invite email
      console.log(`Sending invite email to ${app.email}...`);
      await sendInviteEmail(app.email, app.companyName, setupToken);
      console.log('Invite email process complete.');

      // 6. Update application status
      await db.update(vendorApplications)
          .set({ status: 'approved', processedAt: new Date() })
          .where(eq(vendorApplications.id, id));
      console.log(`Application ${id} status updated to approved.`);

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
