"use client";

import Link from 'next/link';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, Sparkles, Settings, LayoutDashboard, Package, ShoppingBag, Plug, Receipt, LucideIcon, ExternalLink, Store, Truck, Wallet } from 'lucide-react';
import { ReactNode } from "react";

interface NavLinkProps {
    href: string;
    children: ReactNode;
    icon: LucideIcon;
    isActive?: boolean;
}

function NavLink({ href, children, icon: Icon, isActive }: NavLinkProps) {
    return (
        <Link 
            href={href} 
            className={cn(
                "flex items-center gap-2 py-1 px-2 rounded-lg transition-all text-sm font-medium",
                isActive 
                    ? "text-terracotta bg-orange-50 dark:bg-orange-900/10" 
                    : "text-stone-500 hover:text-terracotta dark:text-stone-400 dark:hover:text-stone-300"
            )}
        >
            <Icon className="w-4 h-4" />
            {children}
        </Link>
    );
}

export function AdminLinks() {
    return (
        <a 
            href="https://hub.salp.shop" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-1 px-2 rounded-lg transition-all text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
            <ExternalLink className="w-4 h-4" />
            Central Hub
        </a>
    );
}

export function VendorLinks() {
    const pathname = usePathname();
    
    return (
        <>
            <NavLink href="/dashboard" icon={LayoutDashboard} isActive={pathname === '/dashboard'}>
                Overview
            </NavLink>
            <NavLink href="/dashboard/products" icon={Package} isActive={pathname.startsWith('/dashboard/products')}>
                Products
            </NavLink>
            <NavLink href="/dashboard/orders" icon={ShoppingBag} isActive={pathname.startsWith('/dashboard/orders')}>
                Orders
            </NavLink>
            <NavLink href="/dashboard/integrations" icon={Plug} isActive={pathname.startsWith('/dashboard/integrations')}>
                Integrations
            </NavLink>
            <NavLink href="/dashboard/tax-compliance" icon={Receipt} isActive={pathname === '/dashboard/tax-compliance'}>
                Tax & Invoices
            </NavLink>
            <NavLink href="/dashboard/settings" icon={Settings} isActive={pathname === '/dashboard/settings'}>
                Shop Settings
            </NavLink>
            <NavLink href="/dashboard/brand-page" icon={Store} isActive={pathname === '/dashboard/brand-page'}>
                Brand Page
            </NavLink>
            <NavLink href="/dashboard/shipping" icon={Truck} isActive={pathname === '/dashboard/shipping'}>
                Shipping
            </NavLink>
            <NavLink href="/dashboard/finances" icon={Wallet} isActive={pathname === '/dashboard/finances'}>
                Finances
            </NavLink>
            <NavLink href="/dashboard/request-feature" icon={Sparkles} isActive={pathname === '/dashboard/request-feature'}>
                Request Feature
            </NavLink>
        </>
    );
}
