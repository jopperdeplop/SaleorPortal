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
    temporaryCommissionRate?: number | null;
    temporaryCommissionEndsAt?: string | null;
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
        <h2 className="text-xl font-bold text-carbon dark:text-stone-100">No Brand Associated</h2>
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
      <div className="max-w-4xl mx-auto py-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-border-color shadow-sm text-stone-900 dark:text-stone-100">
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 text-terracotta rounded-full w-fit mx-auto">
           <Receipt size={48} />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Syncing Your Brand...</h2>
        <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
          Your brand portal is currently being prepared. This happens automatically once your store starts processing orders or during the next system sync.
        </p>
      </div>
    );
  }

  const { vendor, commissions, invoices } = data;
  
  const now = new Date();
  const hasActiveOverride = vendor.temporaryCommissionEndsAt && new Date(vendor.temporaryCommissionEndsAt) > now;
  const effectiveRate = hasActiveOverride && vendor.temporaryCommissionRate !== null
    ? vendor.temporaryCommissionRate 
    : vendor.commissionRate;

  return (
    <div className="space-y-8 text-carbon dark:text-stone-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold dark:text-stone-50">Tax & Invoices</h1>
          <p className="text-stone-500 dark:text-stone-400">View payout statements and track platform fee calculations.</p>
        </div>
        <div className="bg-white dark:bg-stone-900 px-6 py-4 rounded-2xl border border-border-color shadow-sm flex items-center gap-6 relative overflow-hidden">
          {hasActiveOverride && (
              <div className="absolute top-0 right-0 bg-terracotta text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  PROMO RATE
              </div>
          )}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">Fee Rate Applied</div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${hasActiveOverride ? "text-terracotta" : "text-carbon dark:text-white"}`}>
                    {effectiveRate}%
                </span>
                {hasActiveOverride && (
                    <span className="text-xs text-stone-400 dark:text-stone-500 line-through font-medium">
                        {vendor.commissionRate}%
                    </span>
                )}
            </div>
          </div>
          <div className="h-10 w-px bg-border-color"></div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">Compliance</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-500 flex items-center gap-1.5">
              <CheckCircle size={18} /> Verified
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Explainer */}
      <div className="bg-stone-50 dark:bg-stone-900 border border-border-color p-6 rounded-3xl flex gap-5 items-start">
          <div className="p-2.5 bg-terracotta/10 text-terracotta rounded-xl flex-shrink-0">
             <AlertCircle size={22} />
          </div>
          <div>
              <h4 className="font-bold text-carbon dark:text-stone-100 mb-1.5">Commission Calculation Logic</h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-3xl">
                  Fees are calculated strictly on the <strong>Net Sale amount (Value before-tax)</strong>. 
                  We do not charge commissions on the VAT component of your sales, ensuring you keep 100% of the tax collected for your filings.
              </p>
          </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-border-color shadow-sm relative group overflow-hidden transition-all hover:border-terracotta/30">
          <div className="absolute top-0 left-0 w-1 h-full bg-terracotta opacity-20 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-5 text-terracotta">
            <Receipt size={24} />
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Marketplace Fees</span>
          </div>
          <div className="flex items-baseline gap-1">
             <span className="text-4xl font-bold dark:text-white">€{commissions.reduce((acc, c) => acc + Number(c.amount), 0).toFixed(2)}</span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-4 font-medium uppercase tracking-tight">Total platform deductions to date</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-border-color shadow-sm relative group overflow-hidden transition-all hover:border-blue-500/30">
           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3 mb-5 text-blue-500">
            <Clock size={24} />
            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Processing Settlements</span>
          </div>
          <span className="text-4xl font-bold dark:text-white">
            {commissions.filter((c) => c.status === 'PENDING').length}
          </span>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-4 font-medium uppercase tracking-tight">Orders currently being reconciled</p>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-border-color shadow-sm overflow-hidden">
        <div className="px-8 py-7 border-b border-border-color bg-stone-50 dark:bg-stone-950/20">
          <h2 className="text-xl font-bold dark:text-stone-50 font-serif">Financial Records</h2>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1.5 uppercase tracking-widest font-bold">Gross revenue vs marketplace commission</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 dark:bg-stone-950/70 text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Reference</th>
                <th className="px-8 py-5">Revenue (Net)</th>
                <th className="px-8 py-5">Rate</th>
                <th className="px-8 py-5">Formula</th>
                <th className="px-8 py-5">Fee Charged</th>
                <th className="px-8 py-5 text-right font-serif invisible">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-stone-400 dark:text-stone-600 italic font-serif text-lg">
                    No financial history found for this brand yet.
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => {
                  const orderInvoices = invoices.filter(inv => inv.orderId === comm.orderId.split("-")[0]);
                  return (
                    <tr key={comm.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group">
                      <td className="px-8 py-6 font-mono text-xs font-bold text-carbon dark:text-stone-300">
                        <span className="text-stone-300 dark:text-stone-600 mr-0.5">ORD-</span>{comm.orderId.split("-")[0]}
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-carbon dark:text-stone-100">
                        €{comm.orderGross ? Number(comm.orderGross).toFixed(2) : '0.00'}
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-400 border border-border-color">
                            {comm.rate || '0'}%
                        </span>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-mono text-stone-400 dark:text-stone-500 font-medium">
                        {Number(comm.orderGross || 0).toFixed(2)} × {(comm.rate || 0)}%
                      </td>
                      <td className="px-8 py-6 font-bold text-sm text-terracotta group-hover:pl-10 transition-all origin-left">
                        -€{Number(comm.amount).toFixed(2)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {orderInvoices.length === 0 ? (
                            <span className="text-[9px] text-stone-400 dark:text-stone-600 uppercase font-bold tracking-tighter italic">Processing...</span>
                          ) : (
                            orderInvoices.map((inv) => (
                              <a 
                                key={inv.id}
                                href={inv.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-terracotta hover:text-carbon dark:hover:text-white transition-colors border border-terracotta/20 px-2 py-1 rounded-md hover:bg-terracotta/5"
                              >
                                <Download size={10} /> {inv.type === 'CUSTOMER' ? 'Receipt' : 'Fee Statement'}
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
