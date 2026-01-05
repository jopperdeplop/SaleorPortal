import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Receipt, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";

async function getTaxData(brandSlug: string) {
  const taxAppUrl = process.env.TAX_APP_URL;
  const taxAppSecret = process.env.TAX_APP_SECRET;

  if (!taxAppUrl || !taxAppSecret) {
    throw new Error("Tax App Configuration Missing");
  }

  const res = await fetch(`${taxAppUrl}/api/vendor/${brandSlug}`, {
    headers: {
      "Authorization": `Bearer ${taxAppSecret}`,
    },
    next: { revalidate: 0 }, // Always fetch fresh data
  });

  if (res.status === 404) {
    return null; // Vendor not found in Tax App
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

  try {
    const data = await getTaxData(session.user.brand);

    if (!data) {
      return (
        <div className="max-w-4xl mx-auto py-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-border-color shadow-sm">
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 text-terracotta rounded-full w-fit mx-auto">
             <Receipt size={48} />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Setup Required</h2>
          <p className="text-stone-500 max-w-md mx-auto mb-8">
            Your brand is not yet registered in our Tax & Commission Engine. 
            This usually happens automatically after your first order.
          </p>
          <div className="inline-block px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs font-mono">
            Brand Slug: {session.user.brand}
          </div>
        </div>
      );
    }

    const { vendor, commissions, invoices } = data;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-carbon dark:text-stone-100">Tax & Invoices</h1>
            <p className="text-stone-500">Manage your VAT compliance and commission statements.</p>
          </div>
          <div className="bg-white dark:bg-stone-900 px-6 py-3 rounded-2xl border border-border-color shadow-sm flex items-center gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Commission Rate</div>
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-border-color shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-terracotta">
              <Receipt size={24} />
              <h3 className="font-bold">Total Commissions</h3>
            </div>
            <p className="text-3xl font-bold text-carbon dark:text-white">
              €{commissions.reduce((acc: any, c: any) => acc + Number(c.amount), 0).toFixed(2)}
            </p>
            <p className="text-sm text-stone-400 mt-2">Life-time platform fees</p>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-border-color shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <Clock size={24} />
              <h3 className="font-bold">Pending Orders</h3>
            </div>
            <p className="text-3xl font-bold text-carbon dark:text-white">
              {commissions.filter((c: any) => c.status === 'PENDING').length}
            </p>
            <p className="text-sm text-stone-400 mt-2">Awaiting payout processing</p>
          </div>
        </div>

        {/* Invoices Table */}
        <section className="bg-white dark:bg-stone-900 rounded-3xl border border-border-color shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-border-color">
            <h2 className="text-xl font-bold">Document History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 dark:bg-stone-950/50">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Order ID</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Document Type</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500">Date Issued</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-stone-500 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-stone-500">
                      No invoices generated yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                      <td className="px-8 py-4 font-mono text-sm">{invoice.orderId}</td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          invoice.type === 'CUSTOMER' 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {invoice.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-stone-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <a 
                          href={invoice.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-terracotta hover:underline font-bold text-sm"
                        >
                          <Download size={14} /> PDF
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );

  } catch (error) {
    console.error("Tax App Proxy Error:", error);
    return (
      <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
        <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400">System Unavailable</h2>
        <p className="text-red-600/80 dark:text-red-400/70 max-w-md mx-auto">
          We couldn't connect to the Tax Engine. Please check that the <code>TAX_APP_URL</code> is configured correctly in SaleorPortal.
        </p>
      </div>
    );
  }
}
