'use client';

import { useActionState, useState, useEffect } from 'react';
import { authenticate } from './actions';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    
    // Store credentials locally to persist across 2FA transition
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [state, formAction, isPending] = useActionState(authenticate, undefined);

    const isOtpRequired = state === "OTP_REQUIRED";
    const isInvalidOtp = state === "INVALID_OTP";
    const genericError = state && !isOtpRequired && !isInvalidOtp ? state : null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-card p-12 rounded-[40px] shadow-2xl border border-border text-carbon">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-terracotta/10 text-terracotta mb-6">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-carbon mb-3 italic">
                        {isOtpRequired ? "Verification Required" : "Vendor Sign In"}
                    </h2>
                    <p className="text-stone-500 text-base">
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
                                <label htmlFor="email" className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-3 ml-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-carbon placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-bold"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3 mx-1">
                                    <label htmlFor="password" className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500">
                                        Password
                                    </label>
                                    <Link 
                                        href="/forgot-password"
                                        className="text-[10px] text-terracotta hover:underline font-extrabold uppercase tracking-widest"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-carbon placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-bold"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Hidden fields to preserve credentials on second submit */}
                            <input type="hidden" name="email" value={email} />
                            <input type="hidden" name="password" value={password} />
                            
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <label htmlFor="code" className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 text-center mb-4">
                                    Security Code
                                </label>
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
                                    className="w-full px-4 py-6 bg-background border border-border rounded-2xl text-center text-3xl tracking-[0.4em] font-mono text-carbon focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
                                />
                                {isInvalidOtp && (
                                    <p className="mt-4 text-xs text-red-500 text-center font-extrabold uppercase tracking-widest italic animate-bounce">
                                        Invalid verification code.
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {genericError && (
                        <div className="text-red-500 text-xs text-center font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-in shake-in" aria-live="polite">
                            {genericError}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full flex justify-center py-5 px-6 bg-terracotta hover:bg-terracotta-dark text-white font-extrabold rounded-2xl shadow-xl shadow-terracotta/20 active:scale-[0.98] disabled:opacity-50 transition-all uppercase text-xs tracking-widest"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                isOtpRequired ? 'Verify & Sign In' : 'Sign In'
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-4">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-stone-400 hover:text-carbon transition-colors text-[10px] font-extrabold uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to Storefront
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
