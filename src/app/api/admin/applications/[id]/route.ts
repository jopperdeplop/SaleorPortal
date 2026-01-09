import { db } from '@/db';
import { vendorApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    
    if (isNaN(applicationId)) {
      return new Response('Invalid ID', { status: 400 });
    }

    const result = await db
      .select()
      .from(vendorApplications)
      .where(eq(vendorApplications.id, applicationId))
      .limit(1);

    if (result.length === 0) {
      return new Response('Application not found', { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error fetching application details:', error);
    return new Response('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const applicationId = parseInt(id);
    
    if (isNaN(applicationId)) {
      return new Response('Invalid ID', { status: 400 });
    }

    // 1. Find the application
    const appResult = await db.query.vendorApplications.findFirst({
      where: (apps, { eq }) => eq(apps.id, applicationId)
    });

    if (!appResult) {
      return new Response('Application not found', { status: 404 });
    }

    const { email } = appResult;

    // 2. Perform deletion in a transaction
    await db.transaction(async (tx) => {
      // Find associated user
      const user = await tx.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email)
      });

      if (user) {
        const { integrations, featureRequests, users: usersTable } = await import('@/db/schema');
        
        // Delete child records first
        await tx.delete(integrations).where(eq(integrations.userId, user.id));
        await tx.delete(featureRequests).where(eq(featureRequests.userId, user.id));
        
        // Delete the user
        await tx.delete(usersTable).where(eq(usersTable.id, user.id));
      }

      // Delete the application
      const { vendorApplications: appsTable } = await import('@/db/schema');
      await tx.delete(appsTable).where(eq(appsTable.id, applicationId));
    });

    return Response.json({ message: 'Vendor and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
