import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

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

                // 2. Check password
                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) return null;

                // 3. Handle 2FA
                if (user.twoFactorEnabled) {
                    if (!code) {
                        throw new Error("OTP_REQUIRED");
                    }

                    const verified = speakeasy.totp.verify({
                        secret: user.twoFactorSecret!,
                        encoding: "base32",
                        token: code,
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
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.brand = user.brand;
                token.role = user.role;
                token.twoFactorEnabled = user.twoFactorEnabled;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string;
            }
            if (token.brand) {
                session.user.brand = token.brand as string;
            }
            if (token.role) {
                session.user.role = token.role as string;
            }
            session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
            return session;
        }
    }
});
