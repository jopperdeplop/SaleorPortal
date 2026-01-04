import { db } from '@/db';
import { featureRequests, users, vendorApplications } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { updateFeatureStatus } from '@/app/actions/request-feature';
import { approveApplication, rejectApplication } from '@/app/actions/admin-applications';
import { 
    User, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Sparkles, 
    ClipboardList, 
    Mail, 
    Building2,
    Calendar,
    ArrowUpRight,
    Search
} from 'lucide-react';
import Link from 'next/link';

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams: { tab?: string };
}) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const activeTab = searchParams.tab || 'applications';

    // Fetch Data
    const featureRequestsData = await db
        .select({
            id: featureRequests.id,
            title: featureRequests.title,
            description: featureRequests.description,
            priority: featureRequests.priority,
            status: featureRequests.status,
            createdAt: featureRequests.createdAt,
            vendorName: users.name,
            vendorBrand: users.brand,
            vendorEmail: users.email,
        })
        .from(featureRequests)
        .leftJoin(users, eq(featureRequests.userId, users.id))
        .orderBy(desc(featureRequests.createdAt));

    const applicationsData = await db
        .select()
        .from(vendorApplications)
        .orderBy(desc(vendorApplications.createdAt));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">
                        Admin Portal
                    </h1>
                    <p className="text-stone-500 dark:text-stone-300">
                        Manage your ecosystem, applications, and vendor requests.
                    </p>
                </div>
                
                <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-vapor dark:border-stone-700">
                    <Link 
                        href="/admin?tab=applications"
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                            activeTab === 'applications' 
                                ? "bg-white dark:bg-stone-900 text-terracotta shadow-sm" 
                                : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                        )}
                    >
                        <ClipboardList className="w-4 h-4" />
                        Applications
                    </Link>
                    <Link 
                        href="/admin?tab=features"
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
                            activeTab === 'features' 
                                ? "bg-white dark:bg-stone-900 text-terracotta shadow-sm" 
                                : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        Feature Requests
                    </Link>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-stone-900 border border-vapor dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                {activeTab === 'applications' ? (
                    <ApplicationsList applications={applicationsData} />
                ) : (
                    <FeatureRequestsList requests={featureRequestsData} />
                )}
            </div>
        </div>
    );
}

function ApplicationsList({ applications }: { applications: any[] }) {
    if (applications.length === 0) {
        return <EmptyState title="No applications found" icon={ClipboardList} />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 border-b border-vapor dark:border-stone-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Company</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-vapor dark:divide-stone-800">
                    {applications.map((app) => (
                        <tr key={app.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-terracotta">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-900 dark:text-white">{app.companyName}</div>
                                        <div className="text-xs text-stone-400">VAT: {app.vatNumber}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex flex-col">
                                    <div className="text-sm font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                                        {app.email}
                                    </div>
                                    <div className="text-xs text-stone-400 mt-1">{app.country}</div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <StatusBadge status={app.status} />
                            </td>
                            <td className="px-6 py-5 text-right">
                                {app.status === 'pending' ? (
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <form action={approveApplication.bind(null, app.id)}>
                                            <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                                Approve
                                            </button>
                                        </form>
                                        <form action={rejectApplication.bind(null, app.id)}>
                                            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                                                Reject
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <span className="text-xs text-stone-400 font-medium italic">
                                        Processed at {app.processedAt ? new Date(app.processedAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function FeatureRequestsList({ requests }: { requests: any[] }) {
    if (requests.length === 0) {
        return <EmptyState title="No feature requests found" icon={Sparkles} />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-stone-50 dark:bg-stone-950 border-b border-vapor dark:border-stone-800">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Vendor</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Request Details</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Priority</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-vapor dark:divide-stone-800">
                    {requests.map((req) => (
                        <tr key={req.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                            <td className="px-6 py-5 align-top">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-terracotta flex-shrink-0">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-900 dark:text-white">{req.vendorBrand}</div>
                                        <div className="text-xs text-stone-500">{req.vendorName}</div>
                                        <a 
                                            href={`mailto:${req.vendorEmail}?subject=Regarding your feature request: ${req.title}`}
                                            className="text-[10px] text-terracotta hover:underline mt-1 inline-flex items-center gap-1 group/link"
                                        >
                                            <Mail className="w-3 h-3" />
                                            Email Vendor
                                            <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <div className="max-w-md">
                                    <div className="text-sm font-bold text-stone-900 dark:text-white mb-1">{req.title}</div>
                                    <p className="text-sm text-stone-500 dark:text-stone-300 line-clamp-2 italic">{req.description}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-3 font-medium uppercase tracking-tighter">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <div className={cn(
                                    "inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-bold",
                                    req.priority === 'high' ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400" :
                                    req.priority === 'medium' ? "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400" :
                                    "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400"
                                )}>
                                    {req.priority}
                                </div>
                            </td>
                            <td className="px-6 py-5 align-top">
                                <StatusBadge status={req.status} />
                            </td>
                            <td className="px-6 py-5 text-right align-top">
                                <div className="flex flex-col items-end gap-2 py-1">
                                    {req.status === 'pending' && (
                                        <form action={updateFeatureStatus.bind(null, req.id, 'approved')}>
                                            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Approve</button>
                                        </form>
                                    )}
                                    {req.status === 'approved' && (
                                        <form action={updateFeatureStatus.bind(null, req.id, 'implemented')}>
                                            <button className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">Mark Implemented</button>
                                        </form>
                                    )}
                                    {(req.status === 'pending' || req.status === 'approved') && (
                                        <form action={updateFeatureStatus.bind(null, req.id, 'rejected')}>
                                            <button className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">Reject</button>
                                        </form>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; icon: any }> = {
        pending: { color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-400', icon: Clock },
        approved: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 dark:text-indigo-400', icon: CheckCircle2 },
        implemented: { color: 'text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400', icon: CheckCircle2 },
        rejected: { color: 'text-stone-600 bg-stone-50 dark:bg-stone-800 dark:text-stone-400', icon: XCircle },
    };

    const { color, icon: Icon } = config[status] || config.pending;

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight", color)}>
            <Icon className="w-3.5 h-3.5" />
            {status}
        </span>
    );
}

function EmptyState({ title, icon: Icon }: { title: string; icon: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-stone-400">
            <Icon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">{title}</p>
        </div>
    );
}
