import { db } from '@/db';
import { featureRequests, users } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { updateFeatureStatus } from '@/app/actions/request-feature';
import { User, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default async function AdminFeatureRequestsPage() {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        redirect('/dashboard');
    }

    const requests = await db
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-terracotta" />
                        Feature Requests
                    </h1>
                    <p className="text-stone-500 mt-1">Manage feature requests from vendors.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-stone-900 shadow-sm border border-vapor dark:border-stone-800 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-vapor dark:divide-stone-800">
                    <thead className="bg-stone-50 dark:bg-stone-950">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Request</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-stone-900 divide-y divide-vapor dark:divide-stone-800">
                        {requests.map((req) => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                                            <User className="h-6 w-6 text-stone-400" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-stone-900 dark:text-white">{req.vendorBrand}</div>
                                            <div className="text-sm text-stone-500">{req.vendorName}</div>
                                            <div className="text-xs text-stone-400">{req.vendorEmail}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <a 
                                            href={`mailto:${req.vendorEmail}?subject=Regarding your feature request: ${req.title}`}
                                            className="text-xs text-terracotta hover:underline font-medium"
                                        >
                                            Start Chat (via Email)
                                        </a>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-stone-900 dark:text-white">{req.title}</div>
                                    <div className="text-sm text-stone-500 line-clamp-2 max-w-md">{req.description}</div>
                                    <div className="text-xs text-stone-400 mt-1">
                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        req.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {req.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center gap-1 ${
                                        req.status === 'implemented' ? 'bg-green-100 text-green-800' :
                                        req.status === 'approved' ? 'bg-indigo-100 text-indigo-800' :
                                        req.status === 'rejected' ? 'bg-stone-100 text-stone-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {req.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                        {req.status === 'implemented' && <CheckCircle2 className="w-3 h-3" />}
                                        {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex flex-col gap-2">
                                        {req.status === 'pending' && (
                                            <form action={updateFeatureStatus.bind(null, req.id, 'approved')}>
                                                <button type="submit" className="text-indigo-600 hover:text-indigo-900">Approve</button>
                                            </form>
                                        )}
                                        {req.status === 'approved' && (
                                            <form action={updateFeatureStatus.bind(null, req.id, 'implemented')}>
                                                <button type="submit" className="text-green-600 hover:text-green-900">Mark Implemented</button>
                                            </form>
                                        )}
                                        {(req.status === 'pending' || req.status === 'approved') && (
                                            <form action={updateFeatureStatus.bind(null, req.id, 'rejected')}>
                                                <button type="submit" className="text-red-600 hover:text-red-900">Reject</button>
                                            </form>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
