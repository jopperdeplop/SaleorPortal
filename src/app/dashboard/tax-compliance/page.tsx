import { auth } from "@/auth";

import { Receipt, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";


interface Commission {
  id: string;
  orderId: string;
  amount: number;
  orderGross?: number;
  rate?: number;
  status: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  orderId: string;
  type: string;
  createdAt: string;
  url: string;
}

interface VendorData {
  vendor: {
    brandName: string;
    commissionRate: number;
  };
  commissions: Commission[];
  invoices: Invoice[];
}

async function getTaxData(brandSlug: string): Promise<VendorData | null> {
  const taxAppUrl = process.env.TAX_APP_URL;
  const taxAppSecret = process.env.TAX_APP_SECRET;

  if (!taxAppUrl || !taxAppSecret) {
    throw new Error("Tax App Configuration Missing");
  }

  // Use URL-safe encoding for the slug
  const res = await fetch(`${taxAppUrl}/api/vendor/${encodeURIComponent(brandSlug)}`, {
    headers: {
      "Authorization": `Bearer ${taxAppSecret}`,
    },
    next: { revalidate: 0 }, 
  });

  if (res.status === 404) {
    return null; 
  }

  if (!res.ok) {
    throw new Error("Failed to fetch tax data");
  }

  return res.json();
}

export default async function TaxCompliancePage() {
  const session = await auth();

  if (!session?.user?.brand) {
    return (
      <div className="p-8 text-center text-stone-500">
        <AlertCircle className="mx-auto mb-4 w-12 h-12" />
        <h2 className="text-xl font-bold">No Brand Associated</h2>
        <p>Please contact support to link your account to a brand.</p>
      </div>
    );
  }

  const brandSlug = session.user.brand as string;
  let data: VendorData | null = null;
  let error: Error | null = null;

  try {
    data = await getTaxData(brandSlug);
  } catch (e) {
    console.error("Tax App Proxy Error:", e);
    error = e as Error;
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
        <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">System Unavailable</h2>
        <p className="text-red-600/80 dark:text-red-400/70 max-w-md mx-auto">
          We couldn&apos;t connect to the Tax Engine. Please check that the <code>TAX_APP_URL</code> is configured correctly in SaleorPortal.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-border-color shadow-sm text-stone-900 dark:text-stone-100">
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 text-terracotta rounded-full w-fit mx-auto">
           <Receipt size={48} />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Syncing Your Brand...</h2>
        <p className="text-stone-500 max-w-md mx-auto mb-8">
          Your brand portal is currently being prepared. This happens automatically once your store starts processing orders or during the next system sync.
        </p>
        <p className="text-xs text-stone-400 italic">
          Account Verified: {session.user.name}
        </p>
      </div>
    );
  }

  const { vendor, commissions, invoices } = data;

  return (
    <div className="space-y-8 text-stone-900 dark:text-stone-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-carbon dark:text-stone-100">Tax & Invoices</h1>
          <p className="text-stone-500">Manage your VAT compliance and commission statements.</p>
        </div>
        <div className="bg-white dark:bg-stone-900 px-6 py-3 rounded-2xl border border-border-color shadow-sm flex items-center gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Default Fee</div>
            <div className="text-xl font-bold text-terracotta">{vendor.commissionRate}%</div>
          </div>
          <div className="h-8 w-px bg-border-color"></div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-stone-400">VAT Status</div>
            <div className="text-xl font-bold text-green-600 flex items-center gap-1">
              <CheckCircle size={16} /> Active
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Explainer */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20 flex gap-4 items-start">
          <div className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-xl">
             <AlertCircle size={20} />
          </div>
          <div>
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">How Fees are Calculated</h4>
              <p className="text-sm text-blue-700/80 dark:text-blue-300/70 leading-relaxed">
                  Platform commissions are calculated based on the <strong>Net Sale amount (excluding VAT)</strong>. 
                  This ensures that marketplace fees are only applied to your actual earnings, not the tax collected on behalf of the government.
              </p>
          </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-border-color shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-terracotta">
            <Receipt size={24} />
            <h3 className="font-bold">Total Fees Invoiced</h3>
          </div>
          <p className="text-3xl font-bold text-carbon dark:text-white">
            €{commissions.reduce((acc, c) => acc + Number(c.amount), 0).toFixed(2)}
          </p>
          <p className="text-sm text-stone-400 mt-2">Deducted from gross payouts</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-border-color shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <Clock size={24} />
            <h3 className="font-bold">Pending Processing</h3>
          </div>
          <p className="text-3xl font-bold text-carbon dark:text-white">
            {commissions.filter((c) => c.status === 'PENDING').length}
          </p>
          <p className="text-sm text-stone-400 mt-2">Orders awaiting final settlement</p>
        </div>
      </div>

      {/* Transactions & Invoices Table */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-border-color shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border-color">
          <h2 className="text-xl font-bold">Payout & Commission Details</h2>
          <p className="text-xs text-stone-500 mt-1">Detailed breakdown of earnings and fee calculations.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-950/50 text-stone-500">
              <tr>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Net Sale (Excl. VAT)</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Fee %</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Calculation</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Marketplace Fee</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-right whitespace-nowrap">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-stone-500">
                    No transaction data available yet.
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => {
                  const orderInvoices = invoices.filter(inv => inv.orderId === comm.orderId.split("-")[0]);
                  return (
                    <tr key={comm.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="px-8 py-4 font-mono text-sm font-bold">#{comm.orderId.split("-")[0]}</td>
                      <td className="px-8 py-4 text-sm font-medium">
                        €{comm.orderGross ? Number(comm.orderGross).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[10px] font-bold">
                            {comm.rate || '0'}%
                        </span>
                      </td>
                      <td className="px-8 py-4 text-[10px] font-mono text-stone-400">
                        {Number(comm.orderGross || 0).toFixed(2)} × {(comm.rate || 0)}%
                      </td>
                      <td className="px-8 py-4 font-bold text-sm text-terracotta">
                        -€{Number(comm.amount).toFixed(2)}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          {orderInvoices.length === 0 ? (
                            <span className="text-[10px] text-stone-400 italic">Generating PDF...</span>
                          ) : (
                            orderInvoices.map((inv) => (
                              <a 
                                key={inv.id}
                                href={inv.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-terracotta hover:underline"
                              >
                                <Download size={10} /> {inv.type === 'CUSTOMER' ? 'Receipt' : 'Statement'}
                              </a>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
