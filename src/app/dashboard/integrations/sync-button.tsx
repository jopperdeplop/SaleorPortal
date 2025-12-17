'use client';

import { useState, useTransition } from 'react';
import { triggerShopifySync } from '@/app/actions/integrations';

interface SyncButtonProps {
    integrationId: number;
}

export default function SyncButton({ integrationId }: SyncButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

    const handleSync = async () => {
        setMessage(null);
        setStatus('running');

        startTransition(async () => {
            const result = await triggerShopifySync(integrationId);

            if (result.success) {
                setStatus('success');
                setMessage('Sync started successfully! Check back in a few minutes.');
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setStatus('idle');
                    setMessage(null);
                }, 5000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Failed to trigger sync. Please try again.');
            }
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={handleSync}
                disabled={isPending || status === 'running'}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isPending || status === 'running'
                        ? 'bg-indigo-300 cursor-not-allowed text-white'
                        : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                    }`}
            >
                {isPending || status === 'running' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Syncing...
                    </>
                ) : (
                    'Sync Products Now'
                )}
            </button>

            {message && (
                <p className={`text-[10px] font-medium ${status === 'error' ? 'text-red-500' : 'text-green-600'
                    } animate-fade-in`}>
                    {message}
                </p>
            )}
        </div>
    );
}
