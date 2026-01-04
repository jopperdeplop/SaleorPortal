import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Settings, Palette, Shield } from "lucide-react";

export default async function AdminSettingsPage() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-10">
            <div>
                <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">
                    Admin Settings
                </h1>
                <p className="text-stone-500 dark:text-stone-300">
                    Configure portal preferences and security settings.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Visual Settings */}
                <section className="bg-white dark:bg-stone-900 border border-vapor dark:border-stone-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-terracotta">
                            <Palette className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white">Appearance</h2>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-vapor dark:border-stone-800">
                        <div>
                            <p className="font-medium text-stone-900 dark:text-white">Interface Theme</p>
                            <p className="text-sm text-stone-500">Toggle between light and dark mode for the entire portal.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </section>

                {/* Security Section (Placeholder for now) */}
                <section className="bg-white dark:bg-stone-900 border border-vapor dark:border-stone-800 rounded-2xl p-6 shadow-sm opacity-60">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-cobalt">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-stone-900 dark:text-white">Security & Access</h2>
                    </div>

                    <div className="py-4 border-t border-vapor dark:border-stone-800 space-y-2">
                        <p className="font-medium text-stone-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-stone-500 italic">Coming soon: Add an extra layer of security to your admin account.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
