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
  } | null;
  settings: {
    defaultCommissionRate: number;
  };
  commissions: Commission[];
  invoices: Invoice[];
}

async function getTaxData(brandSlug: string): Promise<VendorData> {
  const taxAppUrl = process.env.TAX_APP_URL;
  const taxAppSecret = process.env.TAX_APP_SECRET;

  if (!taxAppUrl || !taxAppSecret) {
    throw new Error("Tax App Configuration Missing");
  }

  const authHeader = { "Authorization": `Bearer ${taxAppSecret}` };

  const [vendorRes, settingsRes] = await Promise.all([
    fetch(`${taxAppUrl}/api/vendor/${encodeURIComponent(brandSlug)}`, { headers: authHeader, next: { revalidate: 0 } }),
    fetch(`${taxAppUrl}/api/settings`, { headers: authHeader, next: { revalidate: 60 } })
  ]);

  const settings = settingsRes.ok ? await settingsRes.json() : { defaultCommissionRate: 10.0 };
  let vendorData = null;

  if (vendorRes.ok) {
    vendorData = await vendorRes.json();
  }

  return {
    vendor: vendorData?.vendor || null,
    commissions: vendorData?.commissions || [],
    invoices: vendorData?.invoices || [],
    settings: settings
  };
}

export default async function TaxCompliancePage() {
  const session = await auth();

  if (!session?.user?.brand) {
    return (
      <div className="p-8 text-center text-[var(--text-secondary)]">
        <AlertCircle className="mx-auto mb-4 w-12 h-12" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">No Brand Associated</h2>
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
          We couldn&apos;t connect to the Tax Engine. Please check your configuration.
        </p>
      </div>
    );
  }

  const { vendor, commissions, invoices, settings } = data!;
  
  const now = new Date();
  const hasActiveOverride = vendor?.temporaryCommissionEndsAt && new Date(vendor.temporaryCommissionEndsAt) > now;
  const effectiveRate = vendor 
    ? (hasActiveOverride && vendor.temporaryCommissionRate !== null ? vendor.temporaryCommissionRate : vendor.commissionRate)
    : settings.defaultCommissionRate;

  return (
    <div className="space-y-8 text-[var(--text-primary)] transition-colors">
      {/* Header - Always Visible */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Tax & Invoices</h1>
          <p className="text-[var(--text-secondary)]">Manage your VAT compliance and commission statements.</p>
        </div>
        <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-center gap-6 relative overflow-hidden">
          {hasActiveOverride && (
              <div className="absolute top-0 right-0 bg-terracotta text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                  PROMO RATE
              </div>
          )}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Fee Rate Applied</div>
            <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${hasActiveOverride ? "text-terracotta" : "text-[var(--text-primary)]"}`}>
                    {effectiveRate}%
                </span>
                {hasActiveOverride && (
                    <span className="text-xs text-[var(--text-secondary)] line-through font-medium">
                        {vendor?.commissionRate}%
                    </span>
                )}
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--border-color)]"></div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Status</div>
            <div className={`text-lg font-bold flex items-center gap-1.5 ${vendor ? "text-green-600 dark:text-green-500" : "text-amber-500"}`}>
              {vendor ? <><CheckCircle size={18} /> Verified</> : <><Clock size={18} /> Pending Sync</>}
            </div>
          </div>
        </div>
      </div>

      {/* Calculation Explainer - Always Visible */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-3xl flex gap-5 items-start">
          <div className="p-2.5 bg-terracotta/10 text-terracotta rounded-xl flex-shrink-0">
             <AlertCircle size={22} />
          </div>
          <div>
              <h4 className="font-bold mb-1.5">How Fees are Calculated</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
                  Platform commissions are calculated based on the <strong>Net Sale amount (excluding VAT)</strong>. 
                  This ensures that marketplace fees are only applied to your actual earnings, not the tax collected on behalf of the government.
              </p>
          </div>
      </div>

      {!vendor ? (
        /* Syncing State */
        <div className="max-w-4xl mx-auto py-20 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm mt-8">
          <div className="mb-6 p-4 bg-terracotta/10 text-terracotta rounded-full w-fit mx-auto animate-bounce">
             <Receipt size={48} />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Syncing Your Brand...</h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Your individual brand portal is being prepared. Payout history and detailed metrics will appear here once your store processes its first order or during the next system sync.
          </p>
        </div>
      ) : (
        /* Metrics & Transactions */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm relative group overflow-hidden transition-all hover:border-terracotta/30">
              <div className="absolute top-0 left-0 w-1 h-full bg-terracotta opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-5 text-terracotta">
                <Receipt size={24} />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Total Marketplace Fees</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold">€{commissions.reduce((acc, c) => acc + Number(c.amount), 0).toFixed(2)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-4 font-medium uppercase tracking-tight">Total platform deductions to date</p>
            </div>

            <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm relative group overflow-hidden transition-all hover:border-blue-500/30">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-5 text-blue-500">
                <Clock size={24} />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Processing Settlements</span>
              </div>
              <span className="text-4xl font-bold">
                {commissions.filter((c) => c.status === 'PENDING').length}
              </span>
              <p className="text-xs text-[var(--text-secondary)] mt-4 font-medium uppercase tracking-tight">Orders currently being reconciled</p>
            </div>
          </div>

          <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden border-t-2 border-t-terracotta/20">
            <div className="px-8 py-7 border-b border-[var(--border-color)] bg-stone-50/10 dark:bg-stone-950/20">
              <h2 className="text-xl font-bold font-serif">Financial Records</h2>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 uppercase tracking-widest font-bold">Detailed breakdown of gross revenue vs marketplace commission</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50/30 dark:bg-stone-950/70 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Reference</th>
                    <th className="px-8 py-5">Revenue (Net)</th>
                    <th className="px-8 py-5">Rate</th>
                    <th className="px-8 py-5">Formula</th>
                    <th className="px-8 py-5">Fee Charged</th>
                    <th className="px-8 py-5 text-right font-serif invisible">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-[var(--text-secondary)] italic font-serif text-lg">
                        No financial history found for this brand yet.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((comm) => {
                      const orderInvoices = invoices.filter(inv => inv.orderId === comm.orderId.split("-")[0]);
                      return (
                        <tr key={comm.id} className="hover:bg-stone-50/20 dark:hover:bg-stone-800/40 transition-colors group">
                          <td className="px-8 py-6 font-mono text-xs font-bold">
                            <span className="opacity-40 mr-0.5">ORD-</span>{comm.orderId.split("-")[0]}
                          </td>
                          <td className="px-8 py-6 text-sm font-semibold">
                            €{comm.orderGross ? Number(comm.orderGross).toFixed(2) : '0.00'}
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-bold border border-[var(--border-color)]">
                                {comm.rate || '0'}%
                            </span>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-mono text-[var(--text-secondary)] font-medium">
                            {Number(comm.orderGross || 0).toFixed(2)} × {(comm.rate || 0)}%
                          </td>
                          <td className="px-8 py-6 font-bold text-sm text-terracotta group-hover:pl-4 transition-all origin-left">
                            -€{Number(comm.amount).toFixed(2)}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {orderInvoices.length === 0 ? (
                                <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-tighter italic">Processing...</span>
                              ) : (
                                orderInvoices.map((inv) => (
                                  <a 
                                    key={inv.id}
                                    href={inv.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-terracotta hover:text-[var(--text-primary)] transition-colors border border-terracotta/20 px-2 py-1 rounded-md hover:bg-terracotta/5"
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
        </>
      )}
    </div>
  );
}
