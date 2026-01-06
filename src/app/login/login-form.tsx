'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [state, formAction, isPending] = useActionState(authenticate, undefined);

    const isOtpRequired = state === "OTP_REQUIRED";
    const isInvalidOtp = state === "INVALID_OTP";
    const genericError = state && !isOtpRequired && !isInvalidOtp ? state : null;

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-stone-900 p-8 rounded-xl border border-vapor dark:border-stone-800 shadow-sm">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-stone-400 hover:text-carbon transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-2xl font-serif font-bold text-carbon">
                        {isOtpRequired ? "Two-Factor Auth" : "Sign In"}
                    </h2>
                    <div className="w-5" /> {/* spacer */}
                </div>

                <div className="text-center">
                    <p className="text-stone-500 text-sm">
                        {isOtpRequired 
                            ? "Please enter the code from your Authenticator app." 
                            : "Enter your credentials to access the vendor portal."}
                    </p>
                </div>

                {/* Form */}
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="redirectTo" value={callbackUrl} />
                    
                    {!isOtpRequired ? (
                        <>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="you@company.com"
                                        className="appearance-none block w-full px-3 py-2 border border-vapor dark:border-stone-700 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-carbon bg-white dark:bg-stone-950 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                                        Password
                                    </label>
                                    <Link 
                                        href="/forgot-password"
                                        className="text-xs text-terracotta hover:underline font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        className="appearance-none block w-full px-3 py-2 border border-vapor dark:border-stone-700 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-carbon bg-white dark:bg-stone-950 dark:text-white"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Hidden fields to preserve credentials on second submit */}
                            <input type="hidden" name="email" value={(document.getElementById('email') as HTMLInputElement)?.value} />
                            <input type="hidden" name="password" value={(document.getElementById('password') as HTMLInputElement)?.value} />
                            
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-stone-700 text-center mb-2">
                                    Verification Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="one-time-code"
                                        required
                                        autoFocus
                                        placeholder="000000"
                                        className="appearance-none block w-full px-3 py-4 border border-vapor dark:border-stone-700 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta text-center text-2xl tracking-[0.5em] font-mono text-carbon bg-white dark:bg-stone-950 dark:text-white"
                                    />
                                </div>
                                {isInvalidOtp && (
                                    <p className="mt-2 text-sm text-red-500 text-center font-medium">
                                        Invalid verification code. Please try again.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {genericError && (
                        <div className="text-red-500 text-sm text-center font-medium" aria-live="polite">
                            {genericError}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Signing in...' : (isOtpRequired ? 'Verify Code' : 'Sign in')}
                        </button>
                    </div>

                    {isOtpRequired && (
                        <div className="text-center mt-4">
                            <button 
                                type="button"
                                onClick={() => window.location.reload()}
                                className="text-xs text-stone-400 hover:text-terracotta transition-colors"
                            >
                                Use regular login
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
