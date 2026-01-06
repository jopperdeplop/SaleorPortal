'use server';

import { signIn } from '@/auth';
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
            // Check for our custom 2FA errors
            if (error.cause?.err instanceof Error) {
                if (error.cause.err.message === "OTP_REQUIRED") return "OTP_REQUIRED";
                if (error.cause.err.message === "INVALID_OTP") return "INVALID_OTP";
            }

            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
