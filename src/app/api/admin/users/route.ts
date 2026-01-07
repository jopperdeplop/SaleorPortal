import { db } from '@/db';
import { users } from '@/db/schema';
import { desc, not, like, eq } from 'drizzle-orm';

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

export async function PATCH(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return new Response('User ID is required', { status: 400 });
    }

    // Only allow updating certain fields
    const allowedFields = ['email', 'name', 'brand', 'role', 'twoFactorEnabled'];
    const filteredUpdates: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    await db.update(users)
      .set(filteredUpdates)
      .where(eq(users.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response('Internal Error', { status: 500 });
  }
}
