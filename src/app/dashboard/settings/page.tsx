import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateShopSettings } from '@/app/actions/settings';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Paintbrush, ShieldCheck, Globe, Building2, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SubmitButton } from "@/components/SubmitButton";
import { TwoFactorSetup } from "./TwoFactorSetup";

const EU_COUNTRIES = [
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
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
    const { success } = await searchParams;
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        redirect('/login');
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) return <div>User not found</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Shop Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your brand identity, business registration, and pickup location.</p>
            </div>

            {success && (
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-md text-sm">
                    Your shop profile has been updated successfully!
                </div>
            )}

            <form action={updateShopSettings} className="space-y-8">
                {/* Brand Identity */}
                <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Brand & Business</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Public Brand Name</label>
                            <input type="text" name="brandName" id="brandName" defaultValue={user.brandName || user.brand} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                        <div>
                            <label htmlFor="legalBusinessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Legal Entity Name</label>
                            <input type="text" name="legalBusinessName" id="legalBusinessName" defaultValue={user.legalBusinessName || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                        <div>
                            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Registration #</label>
                            <input type="text" name="registrationNumber" id="registrationNumber" defaultValue={user.registrationNumber || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                        <div>
                            <label htmlFor="saleorPageSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Saleor Page Slug</label>
                            <input type="text" name="saleorPageSlug" id="saleorPageSlug" defaultValue={user.saleorPageSlug || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                            <p className="mt-1 text-xs text-gray-500 italic">Used for "Visit Shop" link on 3D Map.</p>
                        </div>
                    </div>
                </section>

                {/* Tax & Contact */}
                <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tax & Contact</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">EU VAT Number</label>
                            <input type="text" name="vatNumber" id="vatNumber" defaultValue={user.vatNumber || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                        <div>
                            <label htmlFor="eoriNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">EORI Number</label>
                            <input type="text" name="eoriNumber" id="eoriNumber" defaultValue={user.eoriNumber || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                            <input type="tel" name="phoneNumber" id="phoneNumber" defaultValue={user.phoneNumber || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                        <div>
                            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                            <input type="url" name="websiteUrl" id="websiteUrl" defaultValue={user.websiteUrl || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                        </div>
                    </div>
                </section>

                {/* Shipping Channels */}
                <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Channels</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select the EU markets you ship to. Enabling a country will automatically activate your products in the corresponding channel.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {EU_COUNTRIES.map((country) => (
                                <label key={country.code} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="shippingCountries"
                                        value={country.code}
                                        defaultChecked={!user.shippingCountries || (user.shippingCountries as string[]).length === 0 || (user.shippingCountries as string[]).includes(country.code)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{country.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Warehouse Location (3D Map Anchor) */}
                <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-terracotta" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Warehouse Origin</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This location is used for the 3D Vendor Map. Changing this will trigger a background task to refresh your GPS coordinates.</p>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                            <div className="md:col-span-6">
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                                <input type="text" name="street" id="street" defaultValue={user.street || (user.warehouseAddress as any)?.street || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                <input type="text" name="city" id="city" defaultValue={user.city || (user.warehouseAddress as any)?.city || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                                <input type="text" name="zip" id="zip" defaultValue={user.postalCode || (user.warehouseAddress as any)?.zip || ''} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                <select id="country" name="country" defaultValue={user.countryCode || (user.warehouseAddress as any)?.country || 'FR'} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-stone-950 dark:text-white p-2 border">
                                    {EU_COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {user.latitude && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-800 rounded-lg flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    Geocoded at [{user.latitude.toFixed(4)}, {user.longitude?.toFixed(4)}] • Updated {user.geocodedAt?.toLocaleString() || 'Recently'}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <SubmitButton className="w-full md:w-auto px-12 py-3 text-base font-bold">
                        Save Shop Profile
                    </SubmitButton>
                </div>
            </form>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-12 space-y-12">
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-terracotta border-b border-gray-100 dark:border-gray-800 pb-2">
                        <ShieldCheck className="w-5 h-5" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Auth</h2>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <TwoFactorSetup enabled={user.twoFactorEnabled ?? false} />
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-terracotta border-b border-gray-100 dark:border-gray-800 pb-2">
                        <Paintbrush className="w-5 h-5" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance Settings</h2>
                    </div>
                    <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Interface Theme</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Switch between light and dark visual modes.
                                </p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
