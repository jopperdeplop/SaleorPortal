import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            brand: string;
            role: string;
            twoFactorEnabled: boolean;
        } & DefaultSession["user"]
    }
    interface User {
        brand: string;
        role: string;
        twoFactorEnabled: boolean;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                code: { label: "2FA Code", type: "text" },
            },
            authorize: async (credentials) => {
                const parsed = z
                    .object({ 
                        email: z.string().email(), 
                        password: z.string(),
                        code: z.string().optional()
                    })
                    .safeParse(credentials);

                if (!parsed.success) return null;
                const { email, password, code } = parsed.data;

                // 1. Find user
                const user = await db.query.users.findFirst({
                    where: eq(users.email, email),
                });
                if (!user) return null;

                // 3. Block Admin Access (Admin should only use hub.salp.shop)
                if (user.role === 'admin') {
                    throw new Error("ADMIN_NOT_ALLOWED");
                }

                // 2. Check password
                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) return null;

                // 3. Handle 2FA
                if (user.twoFactorEnabled) {
                    if (!code) {
                        throw new Error("OTP_REQUIRED");
                    }

                    const verified = authenticator.verify({
                        token: code,
                        secret: user.twoFactorSecret!,
                    });

                    if (!verified) {
                        throw new Error("INVALID_OTP");
                    }
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    brand: user.brand,
                    role: user.role,
                    twoFactorEnabled: user.twoFactorEnabled
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60, // 12 hours
        updateAge: 1 * 60 * 60, // 1 hour
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.brand = user.brand;
                token.role = user.role;
                token.twoFactorEnabled = user.twoFactorEnabled;
                token.email = user.email;
                token.name = user.name;
            }
            // Allow manual session update
            if (trigger === "update" && session?.twoFactorEnabled !== undefined) {
                token.twoFactorEnabled = session.twoFactorEnabled;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                if (token.id) session.user.id = token.id as string;
                if (token.brand) session.user.brand = token.brand as string;
                if (token.role) session.user.role = token.role as string;
                if (token.email) session.user.email = token.email as string;
                if (token.name) session.user.name = token.name as string;
                session.user.twoFactorEnabled = !!token.twoFactorEnabled;
            }
            return session;
        }
    }
});
