'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    icon?: any;
    placeholder?: string;
    className?: string;
}

export function Select({
    value,
    onChange,
    options,
    icon: Icon,
    placeholder = "Select option",
    className
}: SelectProps) {
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

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between text-left px-4 py-2.5 text-sm font-medium bg-white dark:bg-stone-900 border rounded-xl shadow-sm text-carbon dark:text-stone-100 transition-all duration-200 outline-none",
                    isOpen ? "border-terracotta ring-1 ring-terracotta/20" : "border-vapor dark:border-stone-800 hover:border-terracotta/50"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon className="w-4 h-4 text-stone-400" />}
                    <span className={cn("block truncate", !selectedOption && "text-stone-400")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-200 ml-2 flex-shrink-0", isOpen && "rotate-180 text-terracotta")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-900 border border-vapor dark:border-stone-800 rounded-xl shadow-lg py-2 animate-in fade-in zoom-in-95 duration-100 origin-top overflow-hidden">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors group",
                                    isSelected ? "text-terracotta font-medium bg-orange-50 dark:bg-orange-900/10" : "text-carbon dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-terracotta"
                                )}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
