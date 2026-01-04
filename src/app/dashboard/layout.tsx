import { auth, signOut } from "@/auth";
import Link from 'next/link';
import { LogOut, LayoutDashboard, Package, ShoppingBag, Plug, Settings, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect("/login?callbackUrl=/dashboard");
    }

    const brandName = session?.user?.brand || "Brand Portal";

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-carbon font-sans">
            {/* Header */}
            <header className="h-16 border-b border-vapor dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between px-6 sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-serif font-bold text-terracotta">{brandName}</h1>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {session?.user?.role !== 'admin' && (
                            <>
                                <Link href="/dashboard" className="hover:text-terracotta transition-colors flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" /> Overview
                                </Link>
                                <Link href="/dashboard/products" className="hover:text-terracotta transition-colors flex items-center gap-2">
                                    <Package className="w-4 h-4" /> Products
                                </Link>
                                <Link href="/dashboard/orders" className="hover:text-terracotta transition-colors flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" /> Orders
                                </Link>
                                <Link href="/dashboard/integrations" className="hover:text-terracotta transition-colors flex items-center gap-2">
                                    <Plug className="w-4 h-4" /> Integrations
                                </Link>
                                <Link href="/dashboard/settings" className="hover:text-terracotta transition-colors flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Shop Settings
                                </Link>
                                <Link href="/dashboard/request-feature" className="hover:text-terracotta transition-colors flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Request Feature
                                </Link>
                            </>
                        )}
                        {session?.user?.role === 'admin' && (
                            <Link href="/admin" className="text-terracotta font-bold hover:opacity-80 transition-opacity flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Admin Portal
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-stone-500 hidden sm:inline">
                        Signed in as <span className="font-medium text-carbon">{session?.user?.name}</span>
                    </span>
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirectTo: "/" })
                        }}
                    >
                        <button className="text-sm font-medium text-stone-500 hover:text-terracotta flex items-center gap-2 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </button>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 md:p-12">
                {children}
            </main>
        </div>
    );
}
