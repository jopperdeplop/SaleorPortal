import { auth } from "@/auth";
import { getMetrics, getRecentOrders } from "@/lib/api/client";
import { DollarSign, Package, TrendingUp, Eye } from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from "next/link";

import OrderFilters from "@/components/dashboard/OrderFilters";

export default async function DashboardPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const resolvedParams = await searchParams;

    // Parse Filters
    const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;
    const startDateStr = typeof resolvedParams.startDate === 'string' ? resolvedParams.startDate : undefined;
    const endDateStr = typeof resolvedParams.endDate === 'string' ? resolvedParams.endDate : undefined;

    // Default to Last 14 Days if NO dates are provided
    let startDate: Date | undefined = startDateStr ? new Date(startDateStr) : undefined;
    let endDate: Date | undefined = endDateStr ? new Date(endDateStr) : undefined;

    if (!startDate && !endDate) {
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - 30);
        startDate = past;
    }

    const session = await auth();
    const brand = session?.user?.brand || 'Nike';

    // Pass filters to BOTH metrics and orders
    const metrics = await getMetrics(brand, { status, startDate, endDate });
    const recentOrders = await getRecentOrders(brand, { status, startDate, endDate });

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-serif text-carbon mb-2">Dashboard</h2>
                <p className="text-stone-500">Welcome back, here's what's happening today.</p>
            </header>



            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card p-6 border border-vapor dark:border-border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-stone-500 font-medium">Total Revenue</span>
                        <DollarSign className="w-5 h-5 text-terracotta" />
                    </div>
                    <div className="text-3xl font-serif text-carbon">
                        ${metrics.totalRevenue.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white dark:bg-card p-6 border border-vapor dark:border-border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-stone-500 font-medium">Products Listed</span>
                        <Package className="w-5 h-5 text-cobalt" />
                    </div>
                    <div className="text-3xl font-serif text-carbon">
                        {metrics.productsListed}
                    </div>
                </div>
                <div className="bg-white dark:bg-card p-6 border border-vapor dark:border-border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-stone-500 font-medium">Avg. Order Value</span>
                        <TrendingUp className="w-5 h-5 text-signal" />
                    </div>
                    <div className="text-3xl font-serif text-carbon">
                        ${metrics.averageOrderValue}
                    </div>
                </div>
            </div>

            <OrderFilters defaultStartDate={startDate} defaultEndDate={endDate} />

            {/* Recent Orders */}
            <section className="bg-white dark:bg-card border border-vapor dark:border-border rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-vapor">
                    <h3 className="text-lg font-serif font-medium text-carbon">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Total</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vapor">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-terracotta">
                                        <Link href={`/dashboard/orders/${order.id}`} className="hover:underline">
                                            {order.displayId || order.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-stone-600">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-carbon">{order.customer}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            order.status === 'FULFILLED' && "bg-green-100 text-green-800",
                                            order.status === 'UNFULFILLED' && "bg-yellow-100 text-yellow-800",
                                            order.status === 'CANCELED' && "bg-red-100 text-red-800",
                                            !['FULFILLED', 'UNFULFILLED', 'CANCELED'].includes(order.status) && "bg-gray-100 text-gray-800"
                                        )}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-carbon">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/dashboard/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:text-terracotta-dark transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
