"use client";

import { useState } from "react";
import { Globe, ShieldCheck, ShieldAlert, Check } from "lucide-react";
import { updateProductOverride, clearProductOverride } from "@/app/actions/product-overrides";

const COUNTRIES = [
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

interface Props {
    productId: string;
    globalCountries: string[];
    overrideCountries: string[] | null;
}

export default function ProductOverridesSection({ productId, globalCountries, overrideCountries }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [selected, setSelected] = useState<string[]>(overrideCountries || globalCountries);
    const [isSaving, setIsSaving] = useState(false);

    const isUsingOverride = overrideCountries !== null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProductOverride(productId, selected);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        setIsSaving(true);
        try {
            await clearProductOverride(productId);
            setSelected(globalCountries);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCountry = (code: string) => {
        setSelected(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    if (!isEditing) {
        return (
            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif font-bold text-lg text-carbon dark:text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-terracotta" /> Channel Availability
                    </h2>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-medium text-terracotta hover:underline"
                    >
                        Edit Overrides
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    {isUsingOverride ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                            <ShieldAlert className="w-3.5 h-3.5" /> Product Override Active
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" /> Following Global Settings
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {selected.length > 0 ? (
                        selected.map(code => (
                            <span key={code} className="px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded text-xs text-stone-600 dark:text-stone-300 border border-vapor dark:border-stone-700">
                                {COUNTRIES.find(c => c.code === code)?.name || code}
                            </span>
                        ))
                    ) : (
                        <p className="text-sm text-stone-400 italic">Not available in any channels.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border p-6 mt-6">
            <h2 className="font-serif font-bold text-lg text-carbon dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-terracotta" /> Edit Regional Availability
            </h2>
            
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                Select which countries this product can be shipped to. This will override your global shop settings for this product only.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {COUNTRIES.map((country) => {
                    const isActive = selected.includes(country.code);
                    return (
                        <button
                            key={country.code}
                            onClick={() => toggleCountry(country.code)}
                            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                                isActive 
                                    ? "bg-stone-900 border-stone-900 text-white dark:bg-white dark:border-white dark:text-black" 
                                    : "bg-white border-vapor text-stone-600 hover:bg-stone-50 dark:bg-stone-950 dark:border-stone-800 dark:text-stone-400 dark:hover:bg-stone-900"
                            }`}
                        >
                            <span>{country.name}</span>
                            {isActive && <Check className="w-4 h-4" />}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-vapor dark:border-stone-800">
                <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 disabled:opacity-50"
                >
                    Reset to Global Settings
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setIsEditing(false); setSelected(overrideCountries || globalCountries); }}
                        className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg dark:text-stone-300 dark:hover:bg-stone-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-terracotta text-white text-sm font-bold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Apply Override"}
                    </button>
                </div>
            </div>
        </div>
    );
}
