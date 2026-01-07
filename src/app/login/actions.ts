'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            code: formData.get('code'),
            redirectTo: formData.get('redirectTo') as string | undefined || '/dashboard',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            // Auth.js v5 wraps the error from authorize. 
            // In some environments, it's in cause.err, in others it's different.
            const message = error.cause?.err?.message || error.message || "";
            
            if (message.includes("OTP_REQUIRED")) return "OTP_REQUIRED";
            if (message.includes("INVALID_OTP")) return "INVALID_OTP";
            if (message.includes("ADMIN_NOT_ALLOWED")) return "Admin access not permitted here.";

            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password.';
                default:
                    return 'Authentication failed. Please try again.';
            }
        }
        // CRITICAL: NextAuth uses redirects which are thrown as errors. 
        // We MUST rethrow them or the login will fail to redirect.
        throw error;
    }
}
