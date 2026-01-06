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
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
          <AlertCircle className="w-12 h-12 text-terracotta mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-carbon mb-2">Invalid Link</h1>
          <p className="text-stone-500 mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="text-terracotta hover:underline font-medium">
             Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-carbon mb-2">Password Updated!</h1>
          <p className="text-stone-500 mb-6">Your password has been reset successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-orange-600 mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-serif text-carbon mb-2">Reset Password</h1>
          <p className="text-stone-500 text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
