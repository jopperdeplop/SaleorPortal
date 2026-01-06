import { db } from '@/db';
import { featureRequests, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const requests = await db
      .select({
        id: featureRequests.id,
        title: featureRequests.title,
        description: featureRequests.description,
        priority: featureRequests.priority,
        status: featureRequests.status,
        createdAt: featureRequests.createdAt,
        vendorName: users.name,
        vendorBrand: users.brand,
        vendorEmail: users.email,
      })
      .from(featureRequests)
      .leftJoin(users, eq(featureRequests.userId, users.id))
      .orderBy(desc(featureRequests.createdAt));

    return Response.json(requests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    return new Response('Internal Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return new Response('Invalid request', { status: 400 });
    }

    await db.update(featureRequests)
      .set({ status: status as 'pending' | 'approved' | 'rejected' | 'implemented' })
      .where(eq(featureRequests.id, id));

    return Response.json({ message: 'Feature request status updated' });
  } catch (error) {
    console.error('Error updating feature status:', error);
    return new Response('Internal Error', { status: 500 });
  }
}
