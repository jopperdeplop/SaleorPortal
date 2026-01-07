'use server';

import { signIn } from '@/auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get('email');
        const password = formData.get('password');
        const code = formData.get('code');
        const redirectTo = formData.get('redirectTo') as string || '/dashboard';

        if (!email || !password) {
            return "Email and password are required.";
        }

        await signIn('credentials', {
            email,
            password,
            code: code || undefined,
            redirectTo,
        });

    } catch (error: any) {
        // Next.js Redirects (like after successful sign-in) are thrown as errors.
        // We MUST let them bubble up so Next.js handles the redirect.
        if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) {
            throw error;
        }

        // Check for custom 2FA steps or account errors
        const errorMessage = error.cause?.err?.message || error.cause?.message || error.message || "";
        
        if (errorMessage.includes("OTP_REQUIRED")) return "OTP_REQUIRED";
        if (errorMessage.includes("INVALID_OTP")) return "INVALID_OTP";
        if (errorMessage.includes("ADMIN_NOT_ALLOWED")) return "Administrators must use the Admin Hub.";

        // Known NextAuth error types
        if (error.type === 'CredentialsSignin' || error.name === 'CredentialsSignin') {
            return 'Invalid email or password.';
        }

        console.error("Authentication Error:", error);
        return 'An unexpected error occurred. Please try again.';
    }
}
