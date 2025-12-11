'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Reusing the clean "CustomSelect" styling from OrderFilters for consistency
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface Language {
    code: string;
    name: string;
}

export default function ProductLanguageSelector({
    availableLanguages
}: {
    availableLanguages: Language[]
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Default to EN or the first available if EN not found
    const currentLangCode = searchParams.get('lang') || 'EN';
    const currentLang = availableLanguages.find(l => l.code === currentLangCode) || availableLanguages[0];

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        setIsOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('lang', code);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="relative min-w-[200px]" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between text-left pl-10 pr-4 py-2 text-sm font-medium bg-white border rounded-lg shadow-sm text-carbon transition-all duration-200 outline-none",
                    isOpen ? "border-terracotta ring-1 ring-terracotta/20" : "border-vapor hover:border-terracotta/50"
                )}
            >
                <div className="absolute left-3 flex items-center pointer-events-none text-stone-400">
                    <Globe className="w-4 h-4" />
                </div>
                <span className="block truncate mr-2">{currentLang?.name || currentLangCode}</span>
                <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-200", isOpen && "rotate-180 text-terracotta")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-vapor rounded-xl shadow-lg py-2 animate-in fade-in zoom-in-95 duration-100 origin-top overflow-hidden right-0">
                    <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider bg-stone-50 mb-1">
                        Available Translations
                    </div>
                    {availableLanguages.map((lang) => {
                        const isSelected = lang.code === currentLangCode;
                        return (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={cn(
                                    "w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors group",
                                    isSelected ? "text-terracotta font-medium bg-orange-50" : "text-carbon hover:bg-stone-50 hover:text-terracotta"
                                )}
                            >
                                <span>{lang.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
