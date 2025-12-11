'use client';

import dynamic from 'next/dynamic';
import { FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Dynamically import PDFDownloadLink with no SSR to avoid server-side issues
// @react-pdf/renderer is strictly client-side
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <button disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-400 bg-stone-100 rounded-lg cursor-not-allowed">
                <Loader2 className="w-4 h-4 animate-spin" /> Preparing PDF...
            </button>
        )
    }
);

import InvoicePDF from './InvoicePDF';

export default function DownloadInvoiceButton({ order }: { order: any }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <PDFDownloadLink
            document={<InvoicePDF order={order} />}
            fileName={`invoice-${order.displayId || order.id}.pdf`}
        >
            {/* @ts-ignore - render prop signature mismatch often occurs in react-pdf types, safe to ignore for simple usage */}
            {({ blob, url, loading, error }: any) => (
                <button
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-terracotta hover:bg-terracotta-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 duration-200"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                            <FileText className="w-4 h-4" /> Download VAT Invoice
                        </>
                    )}
                </button>
            )}
        </PDFDownloadLink>
    );
}
