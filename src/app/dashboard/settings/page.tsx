import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateShopSettings } from '@/app/actions/settings';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Paintbrush } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SettingsPage() {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        redirect('/login');
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) return <div>User not found</div>;
    
    interface WarehouseAddress {
        street?: string;
        city?: string;
        zip?: string;
        country?: string;
    }
    const address = (user.warehouseAddress as WarehouseAddress) || {};

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shop Settings</h1>
            <div className="bg-white dark:bg-card shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <form action={updateShopSettings} className="space-y-6">

                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Legal & Tax</h3>
                            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">VAT Number</label>
                                    <div className="mt-1">
                                        <input type="text" name="vatNumber" id="vatNumber" defaultValue={user.vatNumber || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Shipping & Channels</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select the countries you ship to. Your products will automatically be listed in the corresponding Saleor channels.</p>

                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: "Austria", code: "AT" },
                                    { name: "Belgium", code: "BE" },
                                    { name: "Croatia", code: "HR" },
                                    { name: "Cyprus", code: "CY" },
                                    { name: "Estonia", code: "EE" },
                                    { name: "Finland", code: "FI" },
                                    { name: "France", code: "FR" },
                                    { name: "Germany", code: "DE" },
                                    { name: "Greece", code: "GR" },
                                    { name: "Ireland", code: "IE" },
                                    { name: "Italy", code: "IT" },
                                    { name: "Latvia", code: "LV" },
                                    { name: "Lithuania", code: "LT" },
                                    { name: "Luxembourg", code: "LU" },
                                    { name: "Malta", code: "MT" },
                                    { name: "Netherlands", code: "NL" },
                                    { name: "Portugal", code: "PT" },
                                    { name: "Slovakia", code: "SK" },
                                    { name: "Slovenia", code: "SI" },
                                    { name: "Spain", code: "ES" }
                                ].map((country) => (
                                    <label key={country.code} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="shippingCountries"
                                            value={country.code}
                                            defaultChecked={(user.shippingCountries as string[] || []).includes(country.code)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{country.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Warehouse Origin</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This address is used to calculate shipping rates.</p>

                            <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street address</label>
                                    <div className="mt-1">
                                        <input type="text" name="street" id="street" defaultValue={address.street || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                    <div className="mt-1">
                                        <input type="text" name="city" id="city" defaultValue={address.city || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP / Postal code</label>
                                    <div className="mt-1">
                                        <input type="text" name="zip" id="zip" defaultValue={address.zip || ''} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                    <div className="mt-1">
                                        <select id="country" name="country" defaultValue={address.country || 'FR'} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white">
                                            <option value="FR">France</option>
                                            <option value="DE">Germany</option>
                                            <option value="IT">Italy</option>
                                            <option value="ES">Spain</option>
                                            <option value="NL">Netherlands</option>
                                            <option value="PL">Poland</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-end">
                                <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Save Settings
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
            {/* Appearance */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 text-terracotta border-b border-vapor dark:border-border pb-2">
                    <Paintbrush className="w-5 h-5" />
                    <h2 className="text-xl font-serif text-carbon dark:text-white">Appearance</h2>
                </div>
                <div className="bg-white dark:bg-card p-6 rounded-lg border border-vapor dark:border-border shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-carbon">Theme Preference</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                Choose how the portal looks to you.
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </section>
        </div>
    );
}
