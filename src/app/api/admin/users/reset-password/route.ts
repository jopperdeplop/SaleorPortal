import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return new Response('Email is required', { status: 400 });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        return new Response('User not found', { status: 404 });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await db.update(users)
        .set({ resetToken: token, resetTokenExpiry: expiry })
        .where(eq(users.email, email));

    // Send email
    await sendPasswordResetEmail(email, token);

    return Response.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error triggering password reset:', error);
    return new Response('Internal Error', { status: 500 });
  }
}
