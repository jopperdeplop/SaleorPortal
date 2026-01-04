import { auth, signOut } from "@/auth";
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { redirect } from "next/navigation";
import { AdminLinks, VendorLinks } from "@/components/layout/HeaderLinks";
import { ThemeToggle } from "@/components/theme-toggle";

interface PortalLayoutProps {
    children: React.ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
    const session = await auth();
    if (!session) {
        redirect("/login?callbackUrl=/dashboard");
    }

    const brandName = session?.user?.brand || "Brand Portal";

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-carbon font-sans transition-colors duration-300">
            {/* Header */}
            <header className="h-16 border-b border-vapor dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between px-6 sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard">
                        <h1 className="text-2xl font-serif font-bold text-terracotta">{brandName}</h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-4">
                        {session?.user?.role === 'admin' ? <AdminLinks /> : <VendorLinks />}
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 border-r border-vapor dark:border-stone-800 pr-6 mr-2">
                        <ThemeToggle />
                        <span className="text-sm text-stone-500 hidden sm:inline">
                            Signed in as <span className="font-medium text-carbon dark:text-white">{session?.user?.name}</span>
                        </span>
                    </div>
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
