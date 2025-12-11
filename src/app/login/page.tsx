import { signIn } from "@/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const callbackUrl = typeof params.callbackUrl === 'string' ? params.callbackUrl : '/dashboard';

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl border border-vapor shadow-sm">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-stone-400 hover:text-carbon transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-2xl font-serif font-bold text-carbon">Sign In</h2>
                    <div className="w-5" /> {/* spacer */}
                </div>

                <div className="text-center">
                    <p className="text-stone-500 text-sm">
                        Enter your credentials to access the vendor portal.
                    </p>
                </div>

                {/* Form */}
                <form
                    action={async (formData) => {
                        "use server"
                        await signIn("credentials", {
                            email: formData.get("email"),
                            password: formData.get("password"),
                            redirectTo: callbackUrl,
                        });
                    }}
                    className="space-y-6"
                >
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="admin@nike.com"
                                className="appearance-none block w-full px-3 py-2 border border-vapor rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-carbon"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="123"
                                className="appearance-none block w-full px-3 py-2 border border-vapor rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-carbon"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                {/* Credentials Hint */}
                <div className="mt-6 bg-stone-50 p-4 rounded-md border border-vapor text-xs text-stone-500">
                    <p className="font-semibold mb-1">Demo Credentials:</p>
                    <ul className="space-y-1">
                        <li><span className="font-mono text-terracotta">admin@nike.com</span> / <span className="font-mono">123</span></li>
                        <li><span className="font-mono text-terracotta">admin@adidas.com</span> / <span className="font-mono">123</span></li>
                        <li><span className="font-mono text-terracotta">admin@saleor.io</span> / <span className="font-mono">123</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
