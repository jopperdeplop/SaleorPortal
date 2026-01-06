import { NextResponse } from 'next/server';
import { db } from '@/db';
import { featureRequests, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
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

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
