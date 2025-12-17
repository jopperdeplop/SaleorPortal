import { db } from '@/db';
import { vendorApplications } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { approveApplication, rejectApplication } from '@/app/actions/admin-applications';
// import { auth } from '@/auth'; // Assuming you have auth set up
// import { redirect } from 'next/navigation';

export default async function AdminApplicationsPage() {
    // const session = await auth();
    // if (session?.user?.role !== 'admin') redirect('/login');

    const applications = await db.select().from(vendorApplications).orderBy(desc(vendorApplications.createdAt));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Vendor Applications</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {applications.map((app) => (
                        <li key={app.id} className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-indigo-600 truncate">{app.companyName}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {app.status}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500 mr-6">
                                            {app.email}
                                        </p>
                                        <p className="flex items-center text-sm text-gray-500 mr-6">
                                            VAT: {app.vatNumber}
                                        </p>
                                        <p className="flex items-center text-sm text-gray-500">
                                            {app.country}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                        {app.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <form action={approveApplication.bind(null, app.id)}>
                                                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Approve</button>
                                                </form>
                                                <form action={rejectApplication.bind(null, app.id)}>
                                                    <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Reject</button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
