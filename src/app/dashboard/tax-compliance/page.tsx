import { auth } from "@/auth";
import { Receipt, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Commission {
  id: string;
  orderId: string;
  commissionAmount: number;
  commissionNet?: number;
  commissionVat?: number;
  orderGrossTotal?: number;
  orderVatTotal?: number;
  orderVatRate?: number;
  destinationCountry?: string;
  isOss?: boolean;
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
    countryCode: string;
    vatNumber?: string | null;
    temporaryCommissionRate?: number | null;
    temporaryCommissionEndsAt?: string | null;
  } | null;
  settings: {
    defaultCommissionRate: number;
    companyName: string;
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

  const settings = settingsRes.ok ? await settingsRes.json() : { defaultCommissionRate: 10.0, companyName: "Saleor Platform" };
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
      <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 max-w-2xl mx-auto my-12">
        <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Tax Engine Connection Failed</h2>
        <p className="text-red-600/80 dark:text-red-400/70 text-sm mt-2">
          We couldn&apos;t establish a secure connection with the Marketplace Tax service. 
          Please verify your <code>TAX_APP_URL</code> and <code>TAX_APP_SECRET</code> configuration.
        </p>
      </div>
    );
  }

  const { vendor, commissions, invoices, settings } = data!;
  
  // OSS Logic: Group by country for easy tax filing
  const ossSummary = commissions.reduce((acc, comm) => {
    const country = comm.destinationCountry || "Internal";
    if (!acc[country]) {
      acc[country] = { gross: 0, vat: 0, orders: 0 };
    }
    acc[country].gross += Number(comm.orderGrossTotal || 0);
    acc[country].vat += Number(comm.orderVatTotal || 0);
    acc[country].orders += 1;
    return acc;
  }, {} as Record<string, { gross: number, vat: number, orders: number }>);

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
          <h1 className="text-3xl font-serif font-bold tracking-tight">Tax & Compliance</h1>
          <p className="text-[var(--text-secondary)]">Automated EU marketplace fiscal reporting for <strong>{vendor?.brandName || brandSlug}</strong>.</p>
        </div>
        <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-center gap-6 relative overflow-hidden">
          {hasActiveOverride && (
              <div className="absolute top-0 right-0 bg-terracotta text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                  Promo Active
              </div>
          )}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Fee Rate Applied</div>
            <div className="flex flex-col">
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
                {hasActiveOverride && (
                    <span className="text-[10px] font-bold text-terracotta/70 mt-0.5 uppercase tracking-tighter">
                        Ends {new Date(vendor!.temporaryCommissionEndsAt!).toLocaleDateString()}
                    </span>
                )}
            </div>
          </div>
          <div className="h-10 w-px bg-[var(--border-color)]"></div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Tax Identity</div>
            <div className={`text-lg font-bold flex items-center gap-1.5 ${vendor ? "text-green-600 dark:text-green-500" : "text-amber-500"}`}>
              {vendor ? <><CheckCircle size={18} /> {vendor.countryCode} Verified</> : <><Clock size={18} /> Pending Sync</>}
            </div>
          </div>
        </div>
      </div>

      {!data?.vendor ? (
        <div className="bg-card border border-border-custom rounded-[40px] p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
               <Receipt size={40} className="text-accent animate-pulse" />
           </div>
           <h2 className="text-4xl font-extrabold mb-4 tracking-tight font-serif">Syncing Your Brand...</h2>
           <p className="text-text-secondary max-w-md mx-auto leading-relaxed text-sm lg:text-base">
               Your individual brand portal is being prepared for <span className="text-accent font-bold">{brandSlug}</span>. 
               Detailed EU tax metrics and the <span className="text-accent font-bold">10%</span> rate will appear here once your store processes its first order, or after the next automated sync.
           </p>
        </div>
      ) : (
        /* Expert Reporting Panels */
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Total Fees Card */}
            <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-sm relative group overflow-hidden transition-all hover:border-terracotta/30">
              <div className="absolute top-0 left-0 w-1 h-full bg-terracotta opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-3 mb-5 text-terracotta">
                <Receipt size={24} />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Marketplace Fees</span>
              </div>
              <div className="flex items-baseline gap-1">
                 <span className="text-4xl font-bold">€{commissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0).toFixed(2)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-4 font-medium uppercase tracking-tight">Total platform commission & VAT</p>
            </div>

            {/* Tax Intelligence Panel (Expert Feature) */}
            <div className="xl:col-span-2 bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-blue-500">
                        <CheckCircle size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tax Intelligence: OSS Summary</span>
                    </div>
                    <div className="flex gap-2">
                         <a 
                            href={`${process.env.TAX_APP_URL}/api/export?brandSlug=${brandSlug}&type=oss`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-blue-500 hover:text-[var(--text-primary)] transition-colors border border-blue-500/20 px-2 py-1 rounded-md hover:bg-blue-500/5"
                        >
                            <Download size={10} /> Export OSS CSV
                        </a>
                        <a 
                            href={`${process.env.TAX_APP_URL}/api/export?brandSlug=${brandSlug}&type=commissions`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-stone-500 hover:text-[var(--text-primary)] transition-colors border border-stone-500/20 px-2 py-1 rounded-md hover:bg-stone-500/5"
                        >
                            <Download size={10} /> Export Ledger
                        </a>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(ossSummary).length === 0 ? (
                        <div className="col-span-4 py-4 text-center text-xs text-[var(--text-secondary)] italic">
                            Awaiting first transactions for country-based reporting.
                        </div>
                    ) : (
                        Object.entries(ossSummary).map(([country, stats]) => (
                            <div key={country} className="bg-stone-50/50 dark:bg-stone-900/40 p-3 rounded-2xl border border-[var(--border-color)]">
                                <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-1">{country} Sales</div>
                                <div className="text-sm font-bold">€{stats.gross.toFixed(2)}</div>
                                <div className="text-[9px] text-stone-400 mt-1">VAT: €{stats.vat.toFixed(2)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </div>

          <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden border-t-2 border-t-terracotta/20">
            <div className="px-8 py-7 border-b border-[var(--border-color)] bg-stone-50/10 dark:bg-stone-950/20">
              <h2 className="text-xl font-bold font-serif">Fiscal Ledger</h2>
              <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 uppercase tracking-widest font-bold">Full transparency for your quarterly VAT returns and OSS filings</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-left border-collapse">
                <thead className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
                  <tr className="bg-stone-50/50 dark:bg-stone-950/70">
                    <th className="px-8 py-5 border-b border-[var(--border-color)]">Reference</th>
                    <th className="px-8 py-5 text-right border-b border-[var(--border-color)]">Rev. Gross</th>
                    <th className="px-8 py-5 text-center border-b border-[var(--border-color)]">Dest.</th>
                    <th className="px-8 py-5 text-center border-b border-[var(--border-color)]">VAT %</th>
                    <th className="px-8 py-5 text-right border-b border-[var(--border-color)]">Fee Net</th>
                    <th className="px-8 py-5 text-right border-b border-[var(--border-color)]">Fee Tax</th>
                    <th className="px-8 py-5 text-right border-b border-[var(--border-color)]">Net Payout Est.</th>
                    <th className="px-8 py-5 text-right font-serif invisible border-b border-[var(--border-color)]">Docs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-8 py-20 text-center text-[var(--text-secondary)] italic font-serif text-lg">
                        No financial record found yet.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((comm) => {
                      const orderInvoices = invoices.filter(inv => inv.orderId === comm.orderId.split("-")[0]);
                      const payoutEst = Number(comm.orderGrossTotal || 0) - Number(comm.commissionAmount);
                      return (
                        <tr key={comm.id} className="hover:bg-stone-50/20 dark:hover:bg-stone-800/40 transition-colors group">
                          <td className="px-8 py-6 font-mono text-xs font-bold">
                            <span className="opacity-40 mr-0.5">ORD-</span>{comm.orderId.split("-")[0]}
                          </td>
                          <td className="px-8 py-6 text-sm font-semibold text-right">
                            €{Number(comm.orderGrossTotal || 0).toFixed(2)}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 border border-[var(--border-color)]">
                                {comm.destinationCountry || vendor?.countryCode || "NL"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center text-[10px] font-bold text-[var(--text-secondary)]">
                            {comm.orderVatRate ? `${comm.orderVatRate.toFixed(1)}%` : '—'}
                          </td>
                          <td className="px-8 py-6 text-[10px] font-mono text-[var(--text-secondary)] font-medium text-right">
                            €{Number(comm.commissionNet || 0).toFixed(2)}
                          </td>
                          <td className="px-8 py-6 text-[10px] font-mono text-[var(--text-secondary)] font-medium text-right">
                            {Number(comm.commissionVat) > 0 ? `€${Number(comm.commissionVat).toFixed(2)}` : 'REV. CHARGE'}
                          </td>
                          <td className="px-8 py-6 font-bold text-sm text-[var(--text-primary)] text-right">
                             €{payoutEst.toFixed(2)}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {orderInvoices.length === 0 ? (
                                <a 
                                  href={`${process.env.TAX_APP_URL}/api/export?orderId=${comm.orderId}&type=receipt`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase text-blue-500 hover:text-[var(--text-primary)] transition-colors border border-blue-500/20 px-2 py-1 rounded-md hover:bg-blue-500/5"
                                >
                                  <Download size={10} /> Generate Receipt
                                </a>
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
