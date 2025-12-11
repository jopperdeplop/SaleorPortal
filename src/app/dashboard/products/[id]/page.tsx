import { auth } from "@/auth";
import { getVendorProduct } from "@/lib/api/client";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Tag, Layers, ImageIcon } from "lucide-react";
import ProductLanguageSelector from "@/components/products/ProductLanguageSelector";

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
    let descriptionContent;
    try {
        const descJson = JSON.parse(product.description);
        // Rich Text (EditorJS)
        if (descJson.blocks) {
            descriptionContent = (
                <div className="space-y-2">
                    {descJson.blocks.map((b: any, i: number) => (
                        // Use dangerouslySetInnerHTML because EditorJS text can contain inline HTML (b, i, a tags)
                        // This also fixes the issue where wrapped <p> tags in the data were being escaped by React
                        <div key={i} dangerouslySetInnerHTML={{ __html: b.data.text }} />
                    ))}
                </div>
            );
        } else if (typeof descJson === 'string') {
            // Case: Description is a JSON-stringified HTML string (e.g. "\"<p>...</p>\"")
            descriptionContent = <div dangerouslySetInnerHTML={{ __html: descJson }} />;
        } else {
            // Fallback: It was object but not EditorJS blocks? Or null?
            descriptionContent = <div dangerouslySetInnerHTML={{ __html: product.description }} />;
        }
    } catch (e) {
        // Plain Text or HTML String (Not JSON)
        descriptionContent = <div dangerouslySetInnerHTML={{ __html: product.description }} />;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <Link href="/dashboard/products" className="text-stone-500 hover:text-terracotta flex items-center gap-2 text-sm mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Products
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-carbon mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-stone-500">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100">
                                <Tag className="w-3.5 h-3.5" /> {product.category?.name || 'Uncategorized'}
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100">
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

                    {/* Gallery section */}
                    <div className="bg-white rounded-xl shadow-sm border border-vapor overflow-hidden p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-terracotta" /> Media
                        </h2>
                        {product.media && product.media.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.media.map((media: any, i: number) => (
                                    <div key={i} className="aspect-square bg-stone-50 rounded-lg border border-vapor overflow-hidden relative group">
                                        <img src={media.url} alt={media.alt || product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="aspect-video bg-stone-50 rounded-lg border border-vapor flex items-center justify-center text-stone-300">
                                <p className="flex items-center gap-2">No media available <ImageIcon className="w-4 h-4" /></p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-sm border border-vapor p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon mb-4">Description</h2>
                        <div className="prose prose-stone max-w-none text-sm text-stone-600">
                            {descriptionContent || <p className="italic text-stone-400">No description provided.</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Attributes & Variants */}
                <div className="space-y-6">

                    {/* Attributes */}
                    <div className="bg-white rounded-xl shadow-sm border border-vapor p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon mb-4">Attributes</h2>
                        <div className="space-y-3">
                            {product.attributes?.map((attr: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-vapor last:border-0 pb-2 last:pb-0">
                                    <span className="text-stone-500 font-medium">{attr.attribute.name}</span>
                                    <span className="text-carbon">{attr.values.map((v: any) => v.name).join(', ')}</span>
                                </div>
                            ))}
                            {(!product.attributes || product.attributes.length === 0) && (
                                <p className="text-sm text-stone-400 italic">No attributes found.</p>
                            )}
                        </div>
                    </div>

                    {/* Variants Preview */}
                    <div className="bg-white rounded-xl shadow-sm border border-vapor p-6">
                        <h2 className="font-serif font-bold text-lg text-carbon mb-4">Variants</h2>
                        <div className="space-y-3">
                            {product.variants?.map((variant: any) => (
                                <div key={variant.id} className="p-3 rounded-lg bg-stone-50/50 border border-vapor flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-carbon">{variant.name}</p>
                                        <p className="text-xs text-stone-500">SKU: {variant.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-carbon">
                                            {variant.pricing?.price?.gross?.currency} {variant.pricing?.price?.gross?.amount.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-stone-500">
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
