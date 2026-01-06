"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-carbon mb-2">Email Sent!</h1>
          <p className="text-stone-500 mb-8">If an account exists for that email, you will receive a password reset link shortly.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-terracotta hover:underline font-medium"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-carbon mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-serif text-carbon mb-2">Forgot Password?</h1>
          <p className="text-stone-500 text-sm">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-bold py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
