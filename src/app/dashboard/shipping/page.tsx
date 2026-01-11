import { auth } from "@/auth";
import { db } from "@/db";
import { users, shippingMatrices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Truck, Calculator, Save, Info } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { revalidatePath } from "next/cache";

// Zone descriptions
const ZONES = [
    { id: 1, name: "Domestic", description: "Same country (e.g., NL → NL)", countries: "NL" },
    { id: 2, name: "Near EU", description: "Neighboring countries", countries: "BE, DE, LU, FR" },
    { id: 3, name: "Far EU", description: "Wider Europe", countries: "AT, IT, ES, PL, SE, FI, etc." },
    { id: 4, name: "Remote EU", description: "Islands & periphery", countries: "CY, MT, HR, BG, RO" },
];

const TIERS = [
    { id: "small", name: "Small", description: "Letters, accessories" },
    { id: "standard", name: "Standard", description: "Most products" },
    { id: "heavy", name: "Heavy", description: "Large or bulky items" },
];

async function saveShippingMatrix(formData: FormData) {
    "use server";
    
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    if (!userId) return;
    
    const data: Record<string, number> = {};
    for (const zone of [1, 2, 3, 4]) {
        for (const tier of ["small", "standard", "heavy"]) {
            const key = `zone${zone}_${tier}`;
            const value = formData.get(key);
            data[`zone${zone}${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = parseFloat(value as string) || 0;
        }
    }
    
    // Upsert shipping matrix
    const existing = await db.query.shippingMatrices.findFirst({
        where: eq(shippingMatrices.userId, userId),
    });
    
    if (existing) {
        await db.update(shippingMatrices)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(shippingMatrices.id, existing.id));
    } else {
        await db.insert(shippingMatrices).values({
            userId,
            ...data,
        });
    }
    
    revalidatePath("/dashboard/shipping");
}

export default async function ShippingPage() {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        redirect("/login");
    }

    const matrix = await db.query.shippingMatrices.findFirst({
        where: eq(shippingMatrices.userId, userId),
    });

    // Default values if no matrix exists
    const defaults: Record<string, number> = {
        zone1Small: 4.95, zone1Standard: 6.95, zone1Heavy: 12.95,
        zone2Small: 8.95, zone2Standard: 12.95, zone2Heavy: 24.95,
        zone3Small: 12.95, zone3Standard: 18.95, zone3Heavy: 34.95,
        zone4Small: 19.95, zone4Standard: 29.95, zone4Heavy: 49.95,
    };

    const getValue = (zone: number, tier: string): number => {
        const key = `zone${zone}${tier.charAt(0).toUpperCase() + tier.slice(1)}`;
        if (matrix && key in matrix) {
            return (matrix as Record<string, number | null>)[key] ?? defaults[key] ?? 0;
        }
        return defaults[key] ?? 0;
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                        <Truck className="w-6 h-6 text-terracotta" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Shipping Rates</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Configure your shipping prices per zone and product tier.
                </p>
            </header>

            {/* Zone-Tier Matrix */}
            <form action={saveShippingMatrix}>
                <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Zone-Tier Matrix (EUR)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Prices are per order. The highest tier in the cart determines shipping cost.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Zone</th>
                                    {TIERS.map((tier) => (
                                        <th key={tier.id} className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider">
                                            {tier.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {ZONES.map((zone) => (
                                    <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-stone-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">Zone {zone.id}: {zone.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{zone.countries}</div>
                                        </td>
                                        {TIERS.map((tier) => (
                                            <td key={tier.id} className="px-6 py-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        name={`zone${zone.id}_${tier.id}`}
                                                        defaultValue={getValue(zone.id, tier.id)}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-stone-950 text-gray-900 dark:text-white text-center font-medium focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                                                    />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex justify-end">
                        <SubmitButton className="px-6 py-2">
                            <Save className="w-4 h-4 mr-2" />
                            Save Shipping Rates
                        </SubmitButton>
                    </div>
                </section>
            </form>

            {/* Break-Even Calculator */}
            <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-terracotta" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Break-Even Calculator</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Platform Fee:</strong> 10% commission on (subtotal + shipping).
                            To break even, set your listing price = Cost ÷ 0.90
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Cost</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                <input
                                    type="number"
                                    id="costInput"
                                    step="0.01"
                                    placeholder="25.00"
                                    className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-stone-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-terracotta"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <div className="text-3xl font-bold text-gray-400">→</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Listing Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                <input
                                    type="text"
                                    id="priceOutput"
                                    readOnly
                                    placeholder="27.78"
                                    className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-stone-800 text-gray-900 dark:text-white font-bold"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Cost ÷ 0.90</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
