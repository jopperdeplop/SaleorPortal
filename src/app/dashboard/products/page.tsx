import { auth } from "@/auth";
import { getProducts } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Package } from "lucide-react";
import { ProductRow } from "./product-row";

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

            <div className="bg-white border border-vapor rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-500 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-16">Image</th>
                                <th className="px-6 py-3">Product Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vapor">
                            {products.map((product) => (
                                <ProductRow key={product.id} product={product} />
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                                        No products found for {brand}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
