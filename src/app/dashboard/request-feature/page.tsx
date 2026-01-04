import { db } from '@/db';
import { featureRequests } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { requestFeature } from '@/app/actions/request-feature';
import { Sparkles, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { FeatureRequestForm } from './FeatureRequestForm';

export default async function RequestFeaturePage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const myRequests = await db.query.featureRequests.findMany({
        where: eq(featureRequests.userId, parseInt(session.user.id)),
        orderBy: [desc(featureRequests.createdAt)],
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-terracotta" />
                    Request a Feature
                </h1>
                <p className="text-stone-500 dark:text-stone-400 mt-2">
                    Have an idea to make the portal better? Let us know below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-vapor dark:border-stone-800 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold mb-4 text-stone-900 dark:text-white">New Request</h2>
                        <FeatureRequestForm action={requestFeature} />
                    </div>
                </div>

                {/* My Requests List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-stone-900 dark:text-white">
                        <MessageSquare className="w-5 h-5" />
                        My Requests
                    </h2>

                    {myRequests.length === 0 ? (
                        <div className="bg-white dark:bg-stone-900 border border-dashed border-vapor dark:border-stone-800 rounded-xl p-12 text-center text-stone-400">
                            You haven&apos;t submitted any feature requests yet.
                        </div>
                    ) : (
                        myRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-vapor dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                request.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                request.priority === 'medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}>
                                                {request.priority}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                request.status === 'implemented' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                request.status === 'approved' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                                request.status === 'rejected' ? 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' :
                                                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                                {request.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {request.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                                {request.status === 'implemented' && <CheckCircle2 className="w-3 h-3" />}
                                                {request.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {request.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-900 dark:text-white">{request.title}</h3>
                                        <p className="text-stone-600 dark:text-stone-400 mt-2 whitespace-pre-wrap">{request.description}</p>
                                        <p className="text-xs text-stone-400 mt-4">
                                            Submitted on {new Date(request.createdAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
