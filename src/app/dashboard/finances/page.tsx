import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Wallet, Clock, CheckCircle, Download, TrendingUp, Calendar, AlertCircle } from "lucide-react";

const TAX_APP_URL = process.env.TAX_APP_URL || "http://localhost:3001";
const TAX_APP_SECRET = process.env.TAX_APP_SECRET || "";

interface PayoutData {
    pendingBalance: number;
    availableBalance: number;
    nextPayoutDate: string | null;
    payoutHistory: Array<{
        id: string;
        date: string;
        amount: number;
        status: string;
        stripeTransferId: string | null;
    }>;
    documents: Array<{
        id: string;
        orderId: string;
        type: string;
        url: string;
        createdAt: string;
    }>;
}

async function getPayoutData(brand: string): Promise<PayoutData | null> {
    try {
        const response = await fetch(`${TAX_APP_URL}/api/vendor/${brand}/payouts`, {
            headers: {
                "Authorization": `Bearer ${TAX_APP_SECRET}`,
            },
            next: { revalidate: 60 },
        });
        
        if (!response.ok) {
            console.error("Failed to fetch payout data:", response.status);
            return null;
        }
        
        return response.json();
    } catch (error) {
        console.error("Error fetching payout data:", error);
        return null;
    }
}

export default async function FinancesPage() {
    const session = await auth();
    const brand = session?.user?.brand;

    if (!session?.user?.id) {
        redirect("/login");
    }

    const data = await getPayoutData(brand || "");

    // Calculate next Tuesday for payout
    const getNextTuesday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
        const nextTuesday = new Date(today);
        nextTuesday.setDate(today.getDate() + daysUntilTuesday);
        return nextTuesday.toLocaleDateString("en-GB", { 
            weekday: "long",
            day: "numeric",
            month: "short"
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-terracotta/10 rounded-lg">
                        <Wallet className="w-6 h-6 text-terracotta" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Finances</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                    Track your earnings and payout history.
                </p>
            </header>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Balance</span>
                        <Clock className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold font-serif text-gray-900 dark:text-white">
                        €{(data?.pendingBalance || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Awaiting 14-day return window
                    </p>
                </div>

                <div className="bg-white dark:bg-card p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Available Balance</span>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold font-serif text-green-600 dark:text-green-400">
                        €{(data?.availableBalance || 0).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Ready for next payout
                    </p>
                </div>

                <div className="bg-white dark:bg-card p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Next Payout</span>
                        <Calendar className="w-5 h-5 text-terracotta" />
                    </div>
                    <div className="text-xl font-bold font-serif text-gray-900 dark:text-white">
                        {data?.nextPayoutDate || getNextTuesday()}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Weekly payouts on Tuesday
                    </p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200">How Payouts Work</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                        Orders become eligible for payout 14 days after estimated delivery (fulfillment + 5 business days).
                        Payouts are processed weekly on Tuesdays for all eligible orders. Minimum payout: €25.
                    </p>
                </div>
            </div>

            {/* Payout History */}
            <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-terracotta" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payout History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {(data?.payoutHistory || []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No payouts yet. Complete orders to see your payout history.
                                    </td>
                                </tr>
                            ) : (
                                data?.payoutHistory.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-stone-900/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                                            {new Date(payout.date).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                            €{payout.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                payout.status === "COMPLETED" 
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : payout.status === "FAILED"
                                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            }`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                                            {payout.stripeTransferId || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Documents */}
            <section className="bg-white dark:bg-card border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-stone-900/50 flex items-center gap-2">
                    <Download className="w-5 h-5 text-terracotta" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Documents</h2>
                </div>
                <div className="p-6">
                    {(data?.documents || []).length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No documents available yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data?.documents.map((doc) => (
                                <a
                                    key={doc.id}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-900 transition-colors"
                                >
                                    <Download className="w-5 h-5 text-terracotta flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {doc.type === "COMMISSION" ? "Commission Invoice" : "Customer Receipt"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Order #{doc.orderId.split("-")[0]} • {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
