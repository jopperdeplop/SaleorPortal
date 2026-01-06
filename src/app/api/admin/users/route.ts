import { db } from '@/db';
import { users } from '@/db/schema';
import { desc, not, like } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        brand: users.brand,
        role: users.role,
        createdAt: users.createdAt,
        twoFactorEnabled: users.twoFactorEnabled,
      })
      .from(users)
      .where(not(like(users.email, '%@salp.shop'))) // Filter out admins
      .orderBy(desc(users.createdAt));

    return Response.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response('Internal Error', { status: 500 });
  }
}
