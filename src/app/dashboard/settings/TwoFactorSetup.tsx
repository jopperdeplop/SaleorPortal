"use client";

import { useState } from "react";
import { generate2FASecret, enable2FA, disable2FA } from "@/app/actions/two-factor";
import Image from "next/image";
import { ShieldCheck, ShieldAlert, Loader2, QrCode, CheckCircle2 } from "lucide-react";

interface TwoFactorSetupProps {
  enabled: boolean;
}

export function TwoFactorSetup({ enabled }: TwoFactorSetupProps) {
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<"idle" | "showing_qr">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generate2FASecret();
      setQrCode(result.qrCodeUrl);
      setSecret(result.secret);
      setSetupStep("showing_qr");
    } catch (error) {
      console.error(error);
      setError("Failed to generate setup QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!secret || !code) return;
    setLoading(true);
    setError(null);
    try {
      const result = await enable2FA(secret, code);
      if (result.error) {
        setError(result.error);
      } else {
        setSetupStep("idle");
        setQrCode(null);
        setSecret(null);
        setCode("");
      }
    } catch (error) {
      console.error(error);
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Are you sure you want to disable 2FA? This will make your account less secure.")) return;
    setLoading(true);
    try {
      await disable2FA();
    } catch (error) {
      console.error(error);
      setError("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-card rounded-xl border border-vapor dark:border-border">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${enabled ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-stone-100 dark:bg-stone-800 text-stone-400"}`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-carbon dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {enabled ? "Currently enabled and active" : "Add an extra layer of security to your account"}
            </p>
          </div>
        </div>
        {enabled ? (
          <button
            onClick={handleDisable}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-terracotta hover:bg-terracotta/5 rounded-lg transition-colors disabled:opacity-50"
          >
            Disable
          </button>
        ) : setupStep === "idle" && (
          <button
            onClick={handleStartSetup}
            disabled={loading}
            className="px-6 py-2 bg-terracotta hover:bg-terracotta-dark text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
            Setup 2FA
          </button>
        )}
      </div>

      {setupStep === "showing_qr" && qrCode && (
        <div className="p-6 bg-white dark:bg-card border border-vapor dark:border-border rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-carbon dark:text-white mb-4 italic font-serif">Enable 2FA Protection</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
            1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc).<br />
            2. Enter the 6-digit verification code below.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="p-3 bg-white rounded-lg border border-vapor shadow-sm">
              <Image src={qrCode} alt="QR Code" width={160} height={160} unoptimized />
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">6-Digit Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-vapor dark:border-border rounded-lg focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none text-2xl font-mono tracking-[0.5em] text-center transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <ShieldAlert size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-3 bg-terracotta hover:bg-terracotta-dark text-white font-bold rounded-lg transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                  Verify & Enable
                </button>
                <button
                  onClick={() => {
                    setSetupStep("idle");
                    setQrCode(null);
                    setSecret(null);
                    setCode("");
                  }}
                  className="px-6 py-3 border border-vapor dark:border-border text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
