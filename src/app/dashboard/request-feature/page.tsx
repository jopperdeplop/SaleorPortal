import { db } from '@/db';
import { featureRequests } from '@/db/schema';
import { auth } from '@/auth';
import { eq, desc } from 'drizzle-orm';
import { requestFeature } from '@/app/actions/request-feature';
import { Sparkles, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';

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
                <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-terracotta" />
                    Request a Feature
                </h1>
                <p className="text-stone-500 mt-2">
                    Have an idea to make the portal better? Let us know below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-vapor dark:border-stone-800 shadow-sm sticky top-24">
                        <h2 className="text-lg font-bold mb-4">New Request</h2>
                        <form action={requestFeature} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="e.g. Export orders to CSV"
                                    className="w-full px-4 py-2 rounded-lg border border-vapor dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:ring-2 focus:ring-terracotta outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="Tell us more about how this feature would help you..."
                                    className="w-full px-4 py-2 rounded-lg border border-vapor dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:ring-2 focus:ring-terracotta outline-none transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    className="w-full px-4 py-2 rounded-lg border border-vapor dark:border-stone-800 bg-stone-50 dark:bg-stone-950 focus:ring-2 focus:ring-terracotta outline-none transition-all"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-terracotta text-white py-2 rounded-lg font-medium hover:bg-terracotta/90 transition-colors shadow-lg shadow-terracotta/20"
                            >
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>

                {/* My Requests List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
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
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                request.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                request.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                                {request.priority}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                request.status === 'implemented' ? 'bg-green-100 text-green-600' :
                                                request.status === 'approved' ? 'bg-indigo-100 text-indigo-600' :
                                                request.status === 'rejected' ? 'bg-stone-100 text-stone-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                                {request.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {request.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                                                {request.status === 'implemented' && <CheckCircle2 className="w-3 h-3" />}
                                                {request.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {request.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-900">{request.title}</h3>
                                        <p className="text-stone-600 mt-2 whitespace-pre-wrap">{request.description}</p>
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
