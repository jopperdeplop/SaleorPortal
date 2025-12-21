import { db } from '@/db';
import { integrations } from '@/db/schema';
import { auth } from '@/auth';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import DisconnectButton from './disconnect-button';
import SyncButton from './sync-button';
import { decrypt } from '@/lib/encryption';

export default async function IntegrationsPage() {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    if (!userId) {
        redirect('/login');
    }

    const userIntegrations = await db.select().from(integrations).where(eq(integrations.userId, userId));

    const shopifyInt = userIntegrations.find(i => i.provider === 'shopify');
    const wooInt = userIntegrations.find(i => i.provider === 'woocommerce');
    const lightspeedInt = userIntegrations.find(i => i.provider === 'lightspeed');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Integrations</h1>
            <p className="mb-4 text-gray-600 dark:text-gray-400">Connect your external stores to sync products and orders.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Shopify Card */}
                <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                            {/* <img src="/shopify-logo.png" className="h-8 w-8 mr-3" /> */}
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Shopify</h3>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${shopifyInt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {shopifyInt ? 'Connected' : 'Not Connected'}
                        </span>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {shopifyInt ? (
                            <div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Connected to: {shopifyInt.storeUrl}</p>
                                        <p className="text-xs text-gray-400 mt-1">Last sync: Just now</p>
                                    </div>
                                    <DisconnectButton integrationId={shopifyInt.id} />
                                </div>
                                <div className="mt-4">
                                    <SyncButton integrationId={shopifyInt.id} provider="shopify" />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Connect your Shopify store to automatically sync products and orders.
                                </p>
                                <form action="/api/integrations/shopify/auth" method="GET">
                                    <label htmlFor="shop" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="shop"
                                            placeholder="my-store.myshopify.com"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white"
                                            required
                                        />
                                        <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                            Connect
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* WooCommerce Card */}
                <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">WooCommerce</h3>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wooInt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {wooInt ? 'Connected' : 'Not Connected'}
                        </span>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {wooInt ? (
                            <div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Connected to: {wooInt.storeUrl}</p>
                                        <SyncButton integrationId={wooInt.id} provider="woocommerce" />
                                    </div>
                                    <DisconnectButton integrationId={wooInt.id} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Connect your WooCommerce store to automatically sync products and inventory.
                                </p>
                                <form action="/api/integrations/woocommerce/auth" method="GET">
                                    <label htmlFor="shop" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="shop"
                                            placeholder="https://example-shop.com"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white"
                                            required
                                        />
                                        <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                            Connect
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lightspeed Card */}
                <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                    <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Lightspeed (X-Series)</h3>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lightspeedInt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {lightspeedInt ? 'Connected' : 'Not Connected'}
                        </span>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        {lightspeedInt ? (
                            <div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Connected to: {lightspeedInt.storeUrl}</p>
                                        <SyncButton integrationId={lightspeedInt.id} provider="lightspeed" />
                                    </div>
                                    <DisconnectButton integrationId={lightspeedInt.id} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Connect your Lightspeed Retail (X-Series) store to sync products and orders.
                                </p>
                                <form action="/api/integrations/lightspeed/auth" method="GET">
                                    <label htmlFor="shop" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Prefix</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="shop"
                                            placeholder="my-store-prefix"
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md p-2 border bg-white dark:bg-stone-950 dark:text-white"
                                            required
                                        />
                                        <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                            Connect
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
