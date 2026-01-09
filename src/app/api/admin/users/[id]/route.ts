import { db } from '@/db';
import { users, integrations, featureRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return new Response('Invalid ID', { status: 400 });
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return new Response('User not found', { status: 404 });
    }

    // Remove sensitive fields
    const user = result[0];
    const { password: _password, twoFactorSecret: _twoFactorSecret, resetToken: _resetToken, resetTokenExpiry: _resetTokenExpiry, ...safeUser } = user;

    return Response.json(safeUser);
  } catch (error) {
    console.error('Error fetching user details:', error);
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
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return new Response('Invalid ID', { status: 400 });
    }

    // 1. Find the user
    const userResult = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId)
    });

    if (!userResult) {
      return new Response('User not found', { status: 404 });
    }

    // 2. Perform deletion in a transaction
    await db.transaction(async (tx) => {
      // Delete child records first
      await tx.delete(integrations).where(eq(integrations.userId, userId));
      await tx.delete(featureRequests).where(eq(featureRequests.userId, userId));
      
      // Delete the user
      await tx.delete(users).where(eq(users.id, userId));
    });

    return Response.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
