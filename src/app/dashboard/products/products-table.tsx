'use client';

import { Product } from "@/types";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-vapor rounded-lg shadow-sm">

                {/* Search */}
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 block w-full rounded-md border-0 py-1.5 text-carbon ring-1 ring-inset ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-terracotta sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="block w-full sm:w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-carbon ring-1 ring-inset ring-stone-200 focus:ring-2 focus:ring-inset focus:ring-terracotta sm:text-sm sm:leading-6 cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-vapor rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-500 font-medium">
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
