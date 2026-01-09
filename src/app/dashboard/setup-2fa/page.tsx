import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Lock, ShieldAlert } from "lucide-react";
import { TwoFactorSetup } from "../settings/TwoFactorSetup";

export default async function Setup2FAPage() {
  const session = await auth();
  
  // If already enabled, get out of here
  if (session?.user?.twoFactorEnabled) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-stone-950 border border-border-custom rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-4 font-display">Security Required</h1>
            <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
              To protect your vendor account and our marketplace, <strong>Two-Factor Authentication (2FA)</strong> is now mandatory for all partners.
            </p>
          </div>

          <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-border-custom mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-sm">Why is this required?</h3>
                <p className="text-xs text-text-secondary mt-1 leading-normal">
                  Marketplace security is our top priority. 2FA prevents 99.9% of account takeover attacks.
                </p>
              </div>
            </div>

            <TwoFactorSetup enabled={false} />
          </div>

          <p className="text-center text-[10px] text-text-secondary font-bold uppercase tracking-widest opacity-50">
            Access will be granted immediately after setup
          </p>
        </div>
      </div>
    </div>
  );
}
