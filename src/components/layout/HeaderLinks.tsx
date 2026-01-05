"use client";

import Link from 'next/link';
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardList, Sparkles, Settings, LayoutDashboard, Package, ShoppingBag, Plug, Receipt, LucideIcon } from 'lucide-react';
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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'applications';

    return (
        <>
            <NavLink 
                href="/admin?tab=applications" 
                icon={ClipboardList}
                isActive={pathname === '/admin' && activeTab === 'applications'}
            >
                Applications
            </NavLink>
            <NavLink 
                href="/admin?tab=features" 
                icon={Sparkles}
                isActive={pathname === '/admin' && activeTab === 'features'}
            >
                Feature Requests
            </NavLink>
            <NavLink 
                href="/admin/settings" 
                icon={Settings}
                isActive={pathname === '/admin/settings'}
            >
                Admin Settings
            </NavLink>
        </>
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
            <NavLink href="/dashboard/request-feature" icon={Sparkles} isActive={pathname === '/dashboard/request-feature'}>
                Request Feature
            </NavLink>
        </>
    );
}
