'use client';

import { Product } from "@/types";
import { Link } from "lucide-react"; // Wait, Link is next/link, Package is lucide
import NextLink from "next/link";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransition, useState } from "react";
import { toggleProductStatus } from "@/app/actions/product";

interface ProductRowProps {
    product: Product;
}

export function ProductRow({ product }: ProductRowProps) {
    const [isPending, startTransition] = useTransition();
    // Initialize state from prop. 
    // Note: product.isAvailable might be undefined if not fetched, default to false.
    const [isEnabled, setIsEnabled] = useState(!!product.isAvailable);

    const handleToggle = () => {
        const newState = !isEnabled;
        setIsEnabled(newState); // Optimistic update

        startTransition(async () => {
            try {
                await toggleProductStatus(product.id, newState);
            } catch (error) {
                console.error("Failed to toggle product status:", error);
                // Revert on error
                setIsEnabled(!newState);
                alert("Failed to update product status. Please try again.");
            }
        });
    };

    return (
        <tr className="hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors group">
            <td className="px-6 py-4">
                <NextLink href={`/dashboard/products/${encodeURIComponent(product.id)}`}>
                    <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-md flex items-center justify-center text-stone-400 overflow-hidden border border-vapor dark:border-stone-700">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-5 h-5" />
                        )}
                    </div>
                </NextLink>
            </td>
            <td className="px-6 py-4 font-serif font-medium text-lg text-carbon">
                <NextLink href={`/dashboard/products/${encodeURIComponent(product.id)}`} className="hover:text-terracotta transition-colors">
                    {product.name}
                </NextLink>
            </td>
            <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                {product.category}
            </td>
            <td className="px-6 py-4 font-sans font-medium text-carbon">
                {product.currency} {product.price.toFixed(2)}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit",
                        isEnabled ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                    )}>
                        {isEnabled ? 'Active' : 'Inactive'}
                    </span>

                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggle}
                        disabled={isPending}
                        className={cn(
                            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2",
                            isEnabled ? "bg-terracotta" : "bg-stone-200 dark:bg-stone-600",
                            isPending && "opacity-50 cursor-not-allowed"
                        )}
                        role="switch"
                        aria-checked={isEnabled}
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                            aria-hidden="true"
                            className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                isEnabled ? "translate-x-5" : "translate-x-0"
                            )}
                        />
                    </button>
                </div>
            </td>
        </tr>
    );
}
