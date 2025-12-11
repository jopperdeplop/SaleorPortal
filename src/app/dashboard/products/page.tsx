import { auth } from "@/auth";
import { getProducts } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Package } from "lucide-react";

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
                                <th className="px-6 py-3">Stock Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vapor">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-stone-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/products/${encodeURIComponent(product.id)}`}>
                                            <div className="w-10 h-10 bg-stone-100 rounded-md flex items-center justify-center text-stone-400 overflow-hidden border border-vapor">
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
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 font-serif font-medium text-lg text-carbon">
                                        <Link href={`/dashboard/products/${encodeURIComponent(product.id)}`} className="hover:text-terracotta transition-colors">
                                            {product.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">
                                        {product.category}
                                    </td>
                                    <td className="px-6 py-4 font-sans font-medium text-carbon">
                                        {product.currency} {product.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            product.stockStatus === 'In Stock' && "bg-green-100 text-green-800",
                                            product.stockStatus === 'Low Stock' && "bg-yellow-100 text-yellow-800",
                                            product.stockStatus === 'Out of Stock' && "bg-red-100 text-red-800",
                                        )}>
                                            {product.stockStatus}
                                        </span>
                                    </td>
                                </tr>
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
