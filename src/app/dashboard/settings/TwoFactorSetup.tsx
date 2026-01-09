"use client";

import { useState } from "react";
import { generate2FASecret, enable2FA, disable2FA } from "@/app/actions/two-factor";
import Image from "next/image";
import { ShieldCheck, ShieldAlert, Loader2, QrCode, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TwoFactorSetupProps {
  enabled: boolean;
}

export function TwoFactorSetup({ enabled }: TwoFactorSetupProps) {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<"idle" | "showing_qr">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generate2FASecret();
      if (result.error) {
        setError(result.error);
        return;
      }
      setQrCode(result.qrCodeUrl!);
      setSecret(result.secret!);
      setSetupStep("showing_qr");
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to generate setup QR code");
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
        // Trigger session update so middleware knows 2FA is active
        await update({ twoFactorEnabled: true });
        setIsSuccess(true);
        setTimeout(() => {
          setSetupStep("idle");
          setQrCode(null);
          setSecret(null);
          setCode("");
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Verification failed");
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
      <div className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-border-custom transition-all">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${enabled ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-stone-100 dark:bg-stone-800 text-stone-400"}`}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">Two-Factor Authentication</h3>
            <p className="text-xs text-text-secondary">
              {enabled ? "Currently enabled and active" : "Add an extra layer of security to your account"}
            </p>
          </div>
        </div>
        {enabled ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border border-green-500/20">
            <ShieldCheck size={14} /> Enforced
          </div>
        ) : setupStep === "idle" && (
          <button
            onClick={handleStartSetup}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none flex items-center gap-2 disabled:opacity-50 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
            Setup 2FA
          </button>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl text-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 font-bold">
              <ShieldAlert size={20} className="flex-shrink-0" />
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs underline font-bold opacity-80 hover:opacity-100 text-left"
            >
              Wait, something went wrong? Refresh page to sync session.
            </button>
        </div>
      )}

      {setupStep === "showing_qr" && qrCode && (
        <div className="p-6 bg-white dark:bg-stone-900 border border-border-custom rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-text-primary mb-4 font-display">Enable 2FA Protection</h3>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            1. Scan this QR code with your authenticator app.<br />
            2. Enter the 6-digit verification code below.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="p-4 bg-white rounded-2xl border border-border-custom shadow-sm ring-1 ring-black/5">
              <Image src={qrCode} alt="QR Code" width={160} height={160} unoptimized />
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">6-Digit Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-border-custom rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-2xl font-mono tracking-[0.5em] text-center transition-all text-text-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleVerify}
                  disabled={loading || code.length !== 6 || isSuccess}
                  className={`flex-1 py-3.5 ${isSuccess ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : (isSuccess ? <CheckCircle2 size={20} /> : <CheckCircle2 size={20} />)}
                  {isSuccess ? "Enabled!" : "Verify & Enable"}
                </button>
                <button
                  onClick={() => {
                    setSetupStep("idle");
                    setQrCode(null);
                    setSecret(null);
                    setCode("");
                  }}
                  className="px-6 py-3.5 border border-border-custom text-text-secondary hover:bg-stone-50 dark:hover:bg-stone-800 font-bold rounded-xl transition-colors text-sm"
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
