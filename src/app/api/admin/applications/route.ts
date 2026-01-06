import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vendorApplications } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const applications = await db
      .select()
      .from(vendorApplications)
      .orderBy(desc(vendorApplications.createdAt));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
