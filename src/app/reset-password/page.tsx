"use client";

import { useState, Suspense } from "react";
import { setupPassword } from "@/app/actions/auth";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await setupPassword(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card p-12 rounded-[40px] shadow-2xl border border-border text-center">
          <AlertCircle className="w-16 h-16 text-terracotta mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl font-serif text-carbon mb-3">Invalid Link</h1>
          <p className="text-stone-500 mb-8 text-lg">This password reset link is invalid or has expired.</p>
          <Link 
            href="/forgot-password" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-terracotta text-white rounded-full font-bold uppercase text-xs tracking-widest hover:bg-terracotta-dark transition-all"
          >
             Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card p-12 rounded-[40px] shadow-2xl border border-border text-center">
          <CheckCircle2 className="w-16 h-16 text-signal mx-auto mb-6" />
          <h1 className="text-3xl font-serif text-carbon mb-3">Password Updated</h1>
          <p className="text-stone-500 text-lg">Your account security has been restored. Redirecting you to login now...</p>
          <div className="mt-8 flex justify-center">
             <Loader2 className="w-6 h-6 animate-spin text-signal opacity-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card p-12 rounded-[40px] shadow-2xl border border-border">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-terracotta/10 text-terracotta mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-serif text-carbon mb-3">Reset Password</h1>
          <p className="text-stone-500 text-base">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </header>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 text-red-600 rounded-2xl text-sm border border-red-500/20 flex items-center gap-3 font-bold">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="token" value={token} />
          
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-3 ml-1">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-carbon placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-3 ml-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-carbon placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-terracotta/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-terracotta" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
