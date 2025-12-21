'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-stone-900 p-8 rounded-xl border border-vapor dark:border-stone-800 shadow-sm">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-stone-400 hover:text-carbon transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-2xl font-serif font-bold text-carbon">Sign In</h2>
                    <div className="w-5" /> {/* spacer */}
                </div>

                <div className="text-center">
                    <p className="text-stone-500 text-sm">
                        Enter your credentials to access the vendor portal.
                    </p>
                </div>

                {/* Form */}
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="redirectTo" value={callbackUrl} />
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
                                placeholder="admin@saleor.io"
                                className="appearance-none block w-full px-3 py-2 border border-vapor dark:border-stone-700 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-carbon bg-white dark:bg-stone-950 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="saleor"
                                className="appearance-none block w-full px-3 py-2 border border-vapor dark:border-stone-700 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-carbon bg-white dark:bg-stone-950 dark:text-white"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm text-center font-medium" aria-live="polite">
                            {errorMessage}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                {/* Credentials Hint */}
                <div className="mt-6 bg-stone-50 dark:bg-stone-800 p-4 rounded-md border border-vapor dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400">
                    <p className="font-semibold mb-1">Demo Credentials:</p>
                    <ul className="space-y-1">
                        <li><span className="font-mono text-terracotta">admin@saleor.io</span> / <span className="font-mono">saleor</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
