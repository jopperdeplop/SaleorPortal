'use client';

import { Product } from "@/types";
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, Check, Tag } from "lucide-react";
import { ProductRow } from "./product-row";
import { cn } from "@/lib/utils";

interface ProductsTableProps {
    initialProducts: Product[];
}

type SortKey = 'name' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

interface CustomSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    icon?: any;
    placeholder?: string;
}

function CustomSelect({ value, onChange, options, icon: Icon, placeholder = "Select..." }: CustomSelectProps) {
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

    return (
        <div className="relative min-w-[200px]" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between text-left pl-10 pr-4 py-2.5 text-sm font-medium bg-white dark:bg-card border rounded-xl shadow-sm text-carbon dark:text-white transition-all duration-200 outline-none",
                    isOpen ? "border-terracotta ring-1 ring-terracotta/20" : "border-vapor dark:border-stone-700 hover:border-terracotta/50"
                )}
            >
                <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
                    {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className="block truncate">{value || placeholder}</span>
                <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform duration-200", isOpen && "rotate-180 text-terracotta")} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-card border border-vapor dark:border-stone-700 rounded-xl shadow-lg py-2 animate-in fade-in zoom-in-95 duration-100 origin-top overflow-hidden max-h-60 overflow-y-auto">
                    <button
                        onClick={() => {
                            onChange("");
                            setIsOpen(false);
                        }}
                        className={cn(
                            "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors group",
                            value === "" ? "text-terracotta font-medium bg-orange-50 dark:bg-orange-900/10" : "text-carbon dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-terracotta"
                        )}
                    >
                        <span>All Categories</span>
                        {value === "" && <Check className="w-3.5 h-3.5 text-terracotta" />}
                    </button>
                    {options.map((option) => {
                        const isSelected = option === value;
                        return (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors group",
                                    isSelected ? "text-terracotta font-medium bg-orange-50 dark:bg-orange-900/10" : "text-carbon dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-terracotta"
                                )}
                            >
                                <span>{option}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

    // Derive unique categories
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category));
        return Array.from(cats).sort();
    }, [initialProducts]);

    // Handle Sorting Click
    const handleSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filter and Sort
    const processedProducts = useMemo(() => {
        let filtered = [...initialProducts];

        // 1. Filter by Name (Search)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lowerQuery));
        }

        // 2. Filter by Category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // 3. Sort
        filtered.sort((a, b) => {
            const { key, direction } = sortConfig;
            let comparison = 0;

            if (key === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (key === 'price') {
                comparison = a.price - b.price;
            } else if (key === 'status') {
                // Active (isAvailable=true) should come before Inactive usually, or alphabetical status
                // Let's sort by boolean value (true > false)
                const statusA = a.isAvailable ? 1 : 0;
                const statusB = b.isAvailable ? 1 : 0;
                comparison = statusA - statusB;
            }

            return direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [initialProducts, searchQuery, selectedCategory, sortConfig]);

    // Sort Icon Helper
    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 text-stone-300" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-4 h-4 text-terracotta" />
            : <ArrowDown className="w-4 h-4 text-terracotta" />;
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-stone-50/50 dark:bg-stone-900/50 p-2 border border-vapor/50 dark:border-stone-800/50 rounded-2xl shadow-sm">

                {/* Search */}
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 block w-full rounded-xl border-0 py-2.5 text-carbon shadow-sm ring-1 ring-inset ring-vapor dark:ring-stone-700 placeholder:text-stone-400 focus:ring-1 focus:ring-inset focus:ring-terracotta sm:text-sm sm:leading-6 bg-white dark:bg-card dark:text-white transition-all duration-200"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <CustomSelect
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        options={categories}
                        icon={Tag}
                        placeholder="All Categories"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-card border border-vapor dark:border-border rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-16">Image</th>

                                <th
                                    className="px-6 py-3 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        Product Name
                                        <SortIcon columnKey="name" />
                                    </div>
                                </th>

                                <th className="px-6 py-3">Category</th>

                                <th
                                    className="px-6 py-3 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                    onClick={() => handleSort('price')}
                                >
                                    <div className="flex items-center gap-2">
                                        Price
                                        <SortIcon columnKey="price" />
                                    </div>
                                </th>

                                <th
                                    className="px-6 py-3 cursor-pointer hover:bg-stone-100 transition-colors group select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-2">
                                        Status
                                        <SortIcon columnKey="status" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vapor">
                            {processedProducts.map((product) => (
                                <ProductRow key={product.id} product={product} />
                            ))}
                            {processedProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-sm text-stone-500 text-right px-2">
                Showing {processedProducts.length} results
            </div>
        </div>
    );
}
