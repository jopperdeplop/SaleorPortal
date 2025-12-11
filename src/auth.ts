import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsed = z
                    .object({ email: z.string().email(), password: z.string() })
                    .safeParse(credentials);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;
                // 1. Find user in the Database
                const user = await db.query.users.findFirst({
                    where: eq(users.email, email),
                });
                if (!user) return null;
                // 2. Check if the provided password matches the stored HASH
                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) {
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        brand: user.brand
                    };
                }

                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login', // Redirect here if not logged in
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.brand = (user as any).brand;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.brand) {
                session.user.brand = token.brand as string;
            }
            return session;
        }
    }
});