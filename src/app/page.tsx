import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-carbon p-6">
      <div className="max-w-md w-full space-y-8 text-center">

        {/* Logo / Icon */}
        <div className="mx-auto w-16 h-16 bg-white border border-vapor rounded-2xl flex items-center justify-center shadow-sm transform rotate-3">
          <ShoppingBag className="w-8 h-8 text-terracotta" />
        </div>

        {/* Headlines */}
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-carbon">
            Vendor Portal
          </h1>
          <p className="text-stone-500 text-lg">
            Manage your brand, products, and sales in one place.
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-4">
          <Link
            href="/login?callbackUrl=/dashboard"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-terracotta hover:bg-terracotta-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta transition-all shadow-md hover:shadow-lg"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <ArrowRight className="h-5 w-5 text-terracotta-dark group-hover:text-white transition-colors" />
            </span>
            Sign in to Dashboard
          </Link>
        </div>

        {/* Footer / Helper Text */}
        <p className="text-xs text-stone-400">
          Restricted access. Please contact support if you need an account.
        </p>
      </div>
    </div>
  );
}
