import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";
import { TwoFactorSetup } from "../settings/TwoFactorSetup";

export default async function Setup2FAPage() {
  const session = await auth();
  
  // If already enabled, get out of here
  if (session?.user?.twoFactorEnabled) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 shadow-2xl bg-card border border-border rounded-[40px] mt-12 animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-terracotta/10 text-terracotta mb-6">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-4xl font-serif font-bold text-carbon mb-4 italic">Security Enforcement</h1>
        <p className="text-lg text-stone-500 max-w-md mx-auto leading-relaxed">
          To protect your vendor account and our marketplace, <strong>Two-Factor Authentication (2FA)</strong> is now mandatory for all partners.
        </p>
      </div>

      <div className="bg-stone-50 p-8 rounded-[30px] border border-vapor mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-carbon">Why is this required?</h3>
            <p className="text-sm text-stone-500 mt-1">
              Marketplace security is our top priority. 2FA prevents 99.9% of account takeover attacks by requiring a secondary code from your mobile device.
            </p>
          </div>
        </div>

        <TwoFactorSetup enabled={false} />
      </div>

      <p className="text-center text-xs text-stone-400 font-bold uppercase tracking-widest">
        You will be granted access to the dashboard immediately after setup.
      </p>
    </div>
  );
}
