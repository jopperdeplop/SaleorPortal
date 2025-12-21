import { auth } from "@/auth";
import { getProducts } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Package } from "lucide-react";
import { ProductsTable } from "./products-table";

export default async function ProductsPage() {
    const session = await auth();
    const brand = session?.user?.brand || 'Nike';
    const products = await getProducts(brand);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif text-carbon">My Products</h2>
                    <p className="text-stone-500">Manage your catalog and inventory.</p>
                </div>
            </header>

            <ProductsTable initialProducts={products} />
        </div>
    );
}
