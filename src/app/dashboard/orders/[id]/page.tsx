import { auth } from "@/auth";
import { getVendorOrder } from "@/lib/api/client";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, Calendar, CreditCard, Mail, MapPin } from "lucide-react";
import DownloadInvoiceButton from "@/components/pdf/DownloadInvoiceButton";

export default async function OrderDetailsPage({
    params
}: {
    params: { id: string }
}) {
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const session = await auth();
    if (!session?.user?.brand) redirect("/login");

    const order = await getVendorOrder(orderId, session.user.brand);

    if (!order) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/orders" className="text-stone-500 hover:text-terracotta flex items-center gap-2 text-sm mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl font-serif font-bold text-carbon">Order #{order.displayId || order.id}</h1>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium
                            ${order.status === 'FULFILLED' ? 'bg-green-100 text-green-800' :
                                order.status === 'UNFULFILLED' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                        </span>
                        <DownloadInvoiceButton order={order} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Line Items & Customer Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-vapor overflow-hidden">
                        <div className="px-6 py-4 border-b border-vapor">
                            <h2 className="font-serif font-bold text-lg text-carbon flex items-center gap-2">
                                <Package className="w-5 h-5 text-terracotta" /> Order Items
                            </h2>
                        </div>
                        <ul className="divide-y divide-vapor">
                            {order.lines.map((line: any, index: number) => (
                                <li key={index} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-16 h-16 bg-stone-100 rounded-md flex-shrink-0 overflow-hidden border border-vapor">
                                        {line.image ? (
                                            <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-carbon truncate">{line.name}</h3>
                                        <p className="text-sm text-stone-500">Qty: {line.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-carbon">
                                            {line.currency} {line.price.toFixed(2)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-vapor p-6">
                            <h3 className="font-serif font-bold text-base text-carbon mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-stone-400" /> Shipping Address
                            </h3>
                            {order.shippingAddress ? (
                                <address className="not-italic text-sm text-stone-600 space-y-1">
                                    <p className="font-medium text-carbon">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                    <p>{order.shippingAddress.streetAddress1}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country.country}</p>
                                </address>
                            ) : (
                                <p className="text-sm text-stone-400 italic">No shipping address provided.</p>
                            )}
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-vapor p-6">
                            <h3 className="font-serif font-bold text-base text-carbon mb-4 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-stone-400" /> Billing Address
                            </h3>
                            {order.billingAddress ? (
                                <address className="not-italic text-sm text-stone-600 space-y-1">
                                    <p className="font-medium text-carbon">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                                    <p>{order.billingAddress.streetAddress1}</p>
                                    <p>{order.billingAddress.city}, {order.billingAddress.postalCode}</p>
                                    <p>{order.billingAddress.country.country}</p>
                                </address>
                            ) : (
                                <p className="text-sm text-stone-400 italic">Same as shipping address.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-vapor p-6 space-y-6">
                        <h2 className="font-serif font-bold text-lg text-carbon">Order Summary</h2>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">Customer</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-carbon">{order.customerName}</p>
                                        <p className="text-xs text-stone-500">{order.customer}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 block mb-1">Contact</span>
                                <div className="flex items-center gap-2 text-sm text-stone-600">
                                    <Mail className="w-4 h-4 text-stone-400" />
                                    <a href={`mailto:${order.email}`} className="hover:text-terracotta transition-colors">{order.email}</a>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-vapor space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-stone-500">Date Placed</span>
                                    <span className="font-medium text-carbon">{order.date}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-stone-500">Payment Status</span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                        ${order.paymentStatus === 'FULLY_CHARGED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {order.paymentStatus?.replace(/_/g, ' ') || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-vapor">
                            <div className="flex items-center justify-between text-base font-bold text-carbon">
                                <span className="flex items-center gap-2">Your Revenue</span>
                                <span className="text-terracotta">{order.currency} {order.total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-stone-400 mt-2">
                                * This total only includes items fulfilled by your brand.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
