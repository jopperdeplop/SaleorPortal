import { auth } from "@/auth";
import { db } from "@/db";
import { users, shippingMatrices, vendorCountryZones, vendorCountryRates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Truck, Calculator, Save, Info, MapPin, Globe, ChevronRight, Settings2 } from "lucide-react";
import { SubmitButton } from "@/components/SubmitButton";
import { revalidatePath } from "next/cache";
import { EU_COUNTRIES, getProximityZone } from "@/lib/proximity";

const TIERS = [
    { id: "small", name: "Small", description: "Letters, accessories" },
    { id: "standard", name: "Standard", description: "Most products" },
    { id: "heavy", name: "Heavy", description: "Large or bulky items" },
];

const ZONE_NAMES: Record<number, string> = {
    1: "Domestic",
    2: "Near EU",
    3: "Far EU",
    4: "Remote EU"
};

async function saveShippingSettings(formData: FormData) {
    "use server";
    
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    if (!userId) return;

    const action = formData.get('action');

    if (action === 'save_matrix') {
        const data: Record<string, number> = {};
        for (const zone of [1, 2, 3, 4]) {
            for (const tier of ["small", "standard", "heavy"]) {
                const key = `zone${zone}_${tier}`;
                const value = formData.get(key);
                data[`zone${zone}${tier.charAt(0).toUpperCase() + tier.slice(1)}`] = parseFloat(value as string) || 0;
            }
        }
        
        const existing = await db.query.shippingMatrices.findFirst({
            where: eq(shippingMatrices.userId, userId),
        });
        
        if (existing) {
            await db.update(shippingMatrices)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(shippingMatrices.id, existing.id));
        } else {
            await db.insert(shippingMatrices).values({ userId, ...data });
        }
    } else if (action === 'update_zone') {
        const countryCode = formData.get('countryCode') as string;
        const zoneNumber = parseInt(formData.get('zoneNumber') as string);
        
        await db.delete(vendorCountryZones)
            .where(and(eq(vendorCountryZones.userId, userId), eq(vendorCountryZones.countryCode, countryCode)));
        
        await db.insert(vendorCountryZones).values({
            userId,
            countryCode,
            zoneNumber,
            isCustom: true
        });
    } else if (action === 'reset_zones') {
        await db.delete(vendorCountryZones).where(eq(vendorCountryZones.userId, userId));
    } else if (action === 'add_override') {
        const countryCode = formData.get('countryCode') as string;
        const small = Math.round(parseFloat(formData.get('small') as string) * 100);
        const standard = Math.round(parseFloat(formData.get('standard') as string) * 100);
        const heavy = Math.round(parseFloat(formData.get('heavy') as string) * 100);

        await db.delete(vendorCountryRates).where(and(eq(vendorCountryRates.userId, userId), eq(vendorCountryRates.countryCode, countryCode)));
        
        await db.insert(vendorCountryRates).values([
            { userId, countryCode, tier: 'small', price: small },
            { userId, countryCode, tier: 'standard', price: standard },
            { userId, countryCode, tier: 'heavy', price: heavy },
        ]);
    } else if (action === 'delete_override') {
        const countryCode = formData.get('countryCode') as string;
        await db.delete(vendorCountryRates).where(and(eq(vendorCountryRates.userId, userId), eq(vendorCountryRates.countryCode, countryCode)));
    }
    
    revalidatePath("/dashboard/shipping");
}

export default async function ShippingPage() {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        redirect("/login");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) return <div>User not found</div>;

    const matrix = await db.query.shippingMatrices.findFirst({
        where: eq(shippingMatrices.userId, userId),
    });

    const customZones = await db.query.vendorCountryZones.findMany({
        where: eq(vendorCountryZones.userId, userId),
    });

    const overrides = await db.query.vendorCountryRates.findMany({
        where: eq(vendorCountryRates.userId, userId),
    });

    // Group overrides by country
    const countryOverrides = overrides.reduce((acc, curr) => {
        if (!acc[curr.countryCode]) acc[curr.countryCode] = {};
        acc[curr.countryCode][curr.tier] = curr.price / 100;
        return acc;
    }, {} as Record<string, Record<string, number>>);

    const vendorCountry = user.countryCode || 'NL';

    // Build the shipping map
    const zoneMap: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };
    const countryToZone: Record<string, number> = {};

    EU_COUNTRIES.forEach(c => {
        const custom = customZones.find(z => z.countryCode === c.code);
        const zone = custom ? custom.zoneNumber : getProximityZone(vendorCountry, c.code);
        zoneMap[zone].push(c.code);
        countryToZone[c.code] = zone;
    });

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                        <Truck className="w-6 h-6 text-terracotta" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Shipping Configuration</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Manage your domestic and EU shipping zones based on your warehouse in <span className="font-bold text-terracotta">{vendorCountry}</span>.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Zone Matrix Editor */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-serif">Pricing Matrix (EUR)</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Set base prices for each zone and tier.</p>
                            </div>
                            <Globe size={20} className="text-gray-300" />
                        </div>
                        <form action={saveShippingSettings}>
                            <input type="hidden" name="action" value="save_matrix" />
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-stone-50 dark:bg-stone-900 text-[10px] font-bold uppercase tracking-widest text-stone-400 border-b border-gray-100 dark:border-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Target Zone</th>
                                            {TIERS.map(t => <th key={t.id} className="px-6 py-3 text-center">{t.name}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {[1, 2, 3, 4].map(z => (
                                            <tr key={z} className="group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${z === 1 ? 'bg-terracotta' : z === 2 ? 'bg-blue-500' : z === 3 ? 'bg-purple-500' : 'bg-gray-400'}`} />
                                                        <span className="font-bold text-sm text-gray-900 dark:text-white">Zone {z}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 flex flex-wrap gap-1 mt-1 max-w-[150px]">
                                                        {zoneMap[z].slice(0, 5).join(', ')}{zoneMap[z].length > 5 && '...'}
                                                    </div>
                                                </td>
                                                {TIERS.map(t => (
                                                    <td key={t.id} className="px-4 py-3">
                                                        <div className="relative group/input">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold group-focus-within/input:text-terracotta transition-colors">€</span>
                                                            <input 
                                                                type="number" step="0.01" name={`zone${z}_${t.id}`} defaultValue={getValue(z, t.id)}
                                                                className="w-full pl-7 pr-3 py-2 text-center text-sm font-bold bg-gray-50/50 dark:bg-stone-900/50 border border-transparent rounded-lg focus:bg-white dark:focus:bg-stone-950 focus:border-terracotta outline-none transition-all"
                                                            />
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50/30 dark:bg-stone-950/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                <SubmitButton className="px-8 py-2 text-xs font-bold uppercase tracking-widest">
                                    <Save size={14} className="mr-2" />
                                    Sync Pricing
                                </SubmitButton>
                            </div>
                        </form>
                    </section>

                    {/* Break-Even Calculator */}
                    <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-stone-50/50 dark:bg-stone-900/50">
                            <Calculator className="w-5 h-5 text-terracotta" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-serif">Platform Profit Calculator</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                            The platform takes <strong>10% commission</strong> on the total checkout value (items + shipping).
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Item Cost to You</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                                            <input type="number" id="calcInput" placeholder="25.00" className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-stone-900 border border-transparent rounded-lg focus:bg-white focus:border-terracotta outline-none font-bold" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Recommended Listing Price</p>
                                    <div className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        €<span id="calcOutput">0.00</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 italic">Listing = Cost / 0.90</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Country Zone Mapper */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-terracotta" />
                                <h2 className="text-lg font-semibold font-serif">Neighbor Zoning</h2>
                            </div>
                            <form action={saveShippingSettings}>
                                <input type="hidden" name="action" value="reset_zones" />
                                <button type="submit" className="text-[10px] font-bold text-gray-400 hover:text-terracotta uppercase tracking-tighter">Reset</button>
                            </form>
                        </div>
                        <div className="p-4 space-y-6 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                           {[1, 2, 3, 4].map(z => (
                               <div key={z} className="space-y-2">
                                   <div className="flex justify-between items-center px-1">
                                       <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Zone {z}: {ZONE_NAMES[z]}</span>
                                       <span className="text-[10px] text-gray-300">{zoneMap[z].length} Countries</span>
                                   </div>
                                   <div className="grid grid-cols-3 gap-1.5">
                                       {zoneMap[z].concat().sort().map(code => (
                                           <div key={code} className="group relative">
                                                <div className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold text-center transition-all ${
                                                    z === 1 ? 'bg-terracotta/10 border-terracotta/30 text-terracotta' : 
                                                    z === 2 ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' : 
                                                    z === 3 ? 'bg-purple-500/10 border-purple-500/30 text-purple-600' : 
                                                    'bg-gray-100 dark:bg-stone-800 border-transparent text-gray-500'
                                                }`}>
                                                    {code}
                                                </div>
                                                {code !== vendorCountry && (
                                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/95 dark:bg-stone-900/95 flex items-center justify-around rounded-lg shadow-xl transition-all border border-gray-100 dark:border-gray-800 z-10 p-0.5">
                                                        {[2, 3, 4].filter(nz => nz !== z).map(targetZone => (
                                                            <form key={targetZone} action={saveShippingSettings} className="flex">
                                                                <input type="hidden" name="action" value="update_zone" />
                                                                <input type="hidden" name="countryCode" value={code} />
                                                                <input type="hidden" name="zoneNumber" value={targetZone} />
                                                                <button type="submit" className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-stone-800 text-[9px] font-bold border border-transparent hover:border-gray-200 transition-colors">
                                                                    Z{targetZone}
                                                                </button>
                                                            </form>
                                                        ))}
                                                    </div>
                                                )}
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           ))}
                        </div>
                        <div className="p-4 bg-amber-50/30 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20">
                            <div className="flex gap-2">
                                <Settings2 size={14} className="text-amber-600/60 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-amber-800 dark:text-amber-400 leading-tight italic">
                                    Hover a country to move it between zones. Zone 1 is fixed to your business origin.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <script dangerouslySetInnerHTML={{ __html: `
                const input = document.getElementById('calcInput');
                const output = document.getElementById('calcOutput');
                if (input && output) {
                    input.addEventListener('input', (e) => {
                        const val = parseFloat(e.target.value) || 0;
                        output.textContent = (val / 0.90).toFixed(2);
                    });
                }
            `}} />
            {/* Per-Country Overrides */}
            <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-stone-50/50 dark:bg-stone-900/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Settings2 size={18} className="text-purple-500" />
                        <h2 className="text-lg font-semibold font-serif">Country-Specific Overrides</h2>
                    </div>
                </div>
                
                <div className="p-6">
                    <form action={saveShippingSettings} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8 p-4 bg-gray-50/50 dark:bg-stone-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <input type="hidden" name="action" value="add_override" />
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Country</label>
                            <select name="countryCode" className="w-full px-3 py-2 bg-white dark:bg-stone-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm outline-none">
                                {EU_COUNTRIES.filter(c => c.code !== vendorCountry).map(c => (
                                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>
                        {TIERS.map(t => (
                            <div key={t.id}>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t.name}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                                    <input type="number" step="0.01" name={t.id} required className="w-full pl-7 pr-3 py-2 bg-white dark:bg-stone-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-center font-bold outline-none" placeholder="0.00" />
                                </div>
                            </div>
                        ))}
                        <button type="submit" className="px-4 py-2 bg-text-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors">Add</button>
                    </form>

                    {Object.keys(countryOverrides).length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Country</th>
                                        {TIERS.map(t => <th key={t.id} className="px-4 py-2 text-center">{t.name}</th>)}
                                        <th className="px-4 py-2 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {Object.entries(countryOverrides).map(([code, rates]) => (
                                        <tr key={code}>
                                            <td className="px-4 py-3 text-sm font-bold">{EU_COUNTRIES.find(c => c.code === code)?.name}</td>
                                            {TIERS.map(t => (
                                                <td key={t.id} className="px-4 py-3 text-center text-sm font-medium">€{rates[t.id]?.toFixed(2)}</td>
                                            ))}
                                            <td className="px-4 py-3 text-right">
                                                <form action={saveShippingSettings}>
                                                    <input type="hidden" name="action" value="delete_override" />
                                                    <input type="hidden" name="countryCode" value={code} />
                                                    <button type="submit" className="text-[10px] font-bold text-red-500 hover:underline uppercase">Delete</button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                            No country overrides set. Using zone pricing for all.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
