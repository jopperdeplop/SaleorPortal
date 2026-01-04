import PortalLayout from "@/components/layout/PortalLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin - Salp.shop",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PortalLayout>{children}</PortalLayout>;
}
