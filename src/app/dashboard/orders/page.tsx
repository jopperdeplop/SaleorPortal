import { auth } from "@/auth";
import { getRecentOrders } from "@/lib/api/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";

import OrderFilters from "@/components/dashboard/OrderFilters";

export default async function OrdersPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Next 15+ searchParams is async
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
        // endDate defaults to null/undefined which means 'up to now' in our logic, or we can explicit it
    }

    const session = await auth();
    if (!session?.user?.brand) redirect("/login");

    const orders = await getRecentOrders(session.user.brand, {
        status,
        startDate,
        endDate
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-carbon dark:text-white">Orders</h1>
            </div>

            <OrderFilters defaultStartDate={startDate} defaultEndDate={endDate} />

            <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-vapor dark:border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-stone-900 border-b border-vapor dark:border-stone-800 text-sm text-stone-500 dark:text-stone-400">
                            <th className="py-4 px-6 font-medium">Order ID</th>
                            <th className="py-4 px-6 font-medium">Date</th>
                            <th className="py-4 px-6 font-medium">Customer</th>
                            <th className="py-4 px-6 font-medium">Status</th>
                            <th className="py-4 px-6 font-medium text-right">Total Revenue</th>
                            <th className="py-4 px-6 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-vapor">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-stone-500">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-stone-900/50 transition-colors">
                                    <td className="py-4 px-6 font-mono text-sm text-carbon dark:text-stone-200">
                                        <Link href={`/dashboard/orders/${order.id}`} className="hover:text-terracotta underline">
                                            {order.displayId || order.id}
                                        </Link>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-stone-600 dark:text-stone-400">{order.date}</td>
                                    <td className="py-4 px-6 text-sm text-stone-600 dark:text-stone-400">{order.customer}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${order.status === 'FULFILLED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                order.status === 'UNFULFILLED' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                    order.status === 'CANCELED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                        'bg-gray-100 dark:bg-stone-800 text-gray-800 dark:text-stone-300'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-medium text-carbon dark:text-stone-200 text-right">
                                        {order.currency} {order.total.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Link
                                            href={`/dashboard/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
