import { auth } from "@/auth";
import { getVendorProduct } from "@/lib/api/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Layers, ImageIcon } from "lucide-react";
import ProductLanguageSelector from "@/components/products/ProductLanguageSelector";
import ProductOverridesSection from "@/components/products/ProductOverridesSection";
import { db } from "@/db";
import { users, productOverrides } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProductDetailsPage({
    params,
    searchParams
}: {
    params: { id: string };
    searchParams: { lang?: string };
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const session = await auth();
    if (!session?.user?.brand) redirect("/login");

    const productId = resolvedParams.id;
    const lang = resolvedSearchParams.lang || 'EN';

    const product = await getVendorProduct(productId, lang);

    if (!product) {
        notFound();
    }

    // Parse Description logic
    let descriptionData: unknown = null;
    try {
        descriptionData = JSON.parse(product.description);
    } catch {
        descriptionData = product.description;
    }

    let descriptionContent;
    const isBlocks = (data: any): data is { blocks: { data: { text: string } }[] } => 
        data && typeof data === 'object' && 'blocks' in data;

    if (isBlocks(descriptionData)) {
        descriptionContent = (
            <div className="space-y-2">
                {descriptionData.blocks.map((b, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: b.data.text }} />
                ))}
            </div>
        );
    } else if (typeof descriptionData === 'string') {
        descriptionContent = <div dangerouslySetInnerHTML={{ __html: descriptionData }} />;
    } else {
        descriptionContent = <div dangerouslySetInnerHTML={{ __html: product.description }} />;
    }

    // Fetch Global and Override Settings
    const user = await db.query.users.findFirst({
        where: eq(users.brand, session.user.brand!)
    });
    const globalCountries = (user?.shippingCountries as string[]) || [];

    const override = await db.query.productOverrides.findFirst({
        where: eq(productOverrides.productId, productId)
    });
    const overrideCountries = override ? (override.shippingCountries as string[]) : null;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <Link href="/dashboard/products" className="text-stone-500 hover:text-terracotta flex items-center gap-2 text-sm mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-carbon dark:text-white mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800">
                                <Tag className="w-3.5 h-3.5" /> {product.category?.name || 'Uncategorized'}
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800">
                                <Layers className="w-3.5 h-3.5" /> {product.variants?.length || 0} Variants
                            </span>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-stone-400 uppercase mb-1.5 ml-1">
                            Editing Language
                        </label>
                        <ProductLanguageSelector availableLanguages={product.availableLanguages} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Gallery & Description */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Channel Availability (New) */}
                    <ProductOverridesSection 
                        productId={productId}
                        globalCountries={globalCountries}
                        overrideCountries={overrideCountries}
                    />

                    {/* Gallery section */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border overflow-hidden p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon dark:text-white mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-terracotta" /> Media
                        </h2>
                        {product.media && product.media.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.media.map((media: { url: string; alt: string | null }, i: number) => (
                                    <div key={i} className="aspect-square bg-stone-50 dark:bg-stone-900 rounded-lg border border-vapor dark:border-stone-700 overflow-hidden relative group">
                                        <img src={media.url} alt={media.alt || product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="aspect-video bg-stone-50 dark:bg-stone-900 rounded-lg border border-vapor dark:border-stone-700 flex items-center justify-center text-stone-300 dark:text-stone-600">
                                <p className="flex items-center gap-2">No media available <ImageIcon className="w-4 h-4" /></p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon dark:text-white mb-4">Description</h2>
                        <div className="prose prose-stone dark:prose-invert max-w-none text-sm text-stone-600 dark:text-stone-300">
                            {descriptionContent || <p className="italic text-stone-400">No description provided.</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Attributes & Variants */}
                <div className="space-y-6">

                    {/* Attributes */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon dark:text-white mb-4">Attributes</h2>
                        <div className="space-y-3">
                            {product.attributes?.map((attr: { attribute: { name: string }, values: { name: string }[] }, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-vapor dark:border-stone-800 last:border-0 pb-2 last:pb-0">
                                    <span className="text-stone-500 dark:text-stone-400 font-medium">{attr.attribute.name}</span>
                                    <span className="text-carbon dark:text-stone-200">{attr.values.map((v: { name: string }) => v.name).join(', ')}</span>
                                </div>
                            ))}
                            {(!product.attributes || product.attributes.length === 0) && (
                                <p className="text-sm text-stone-400 italic">No attributes found.</p>
                            )}
                        </div>
                    </div>

                    {/* Variants Preview */}
                    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon dark:text-white mb-4">Variants</h2>
                        <div className="space-y-3">
                            {product.variants?.map((variant: { id: string; name: string; sku: string; pricing: { price: { gross: { currency: string; amount: number } } }; quantityAvailable: number }) => (
                                <div key={variant.id} className="p-3 rounded-lg bg-stone-50/50 dark:bg-stone-900/50 border border-vapor dark:border-stone-800 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-carbon dark:text-stone-200">{variant.name}</p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">SKU: {variant.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-carbon dark:text-white">
                                            {variant.pricing?.price?.gross?.currency} {variant.pricing?.price?.gross?.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-stone-500 dark:text-stone-400">
                                            {variant.quantityAvailable > 0 ? `${variant.quantityAvailable} in stock` : 'Out of stock'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
