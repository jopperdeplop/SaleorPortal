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
