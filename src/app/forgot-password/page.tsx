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
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card p-12 rounded-[40px] shadow-2xl border border-border text-center">
          <CheckCircle2 className="w-16 h-16 text-signal mx-auto mb-6" />
          <h1 className="text-3xl font-serif text-carbon mb-3 font-bold">Email Sent!</h1>
          <p className="text-stone-500 mb-10 text-lg">If an account exists for that email, you will receive a password reset link shortly.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-terracotta hover:underline font-extrabold uppercase text-xs tracking-widest"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card p-12 rounded-[40px] shadow-2xl border border-border">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-carbon mb-10 transition-colors text-xs font-extrabold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-terracotta/10 text-terracotta mb-6">
            <Mail size={40} />
          </div>
          <h1 className="text-3xl font-serif text-carbon mb-3 font-bold">Forgot Password?</h1>
          <p className="text-stone-500 text-base">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </header>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 text-red-600 rounded-2xl text-sm border border-red-500/20 flex items-center gap-3 font-bold">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-3 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@company.com"
              className="w-full px-6 py-4 bg-background border border-border rounded-2xl text-carbon placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-terracotta/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
