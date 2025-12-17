'use client';

import { useState } from 'react';
import { disconnectShopify } from '@/app/actions/integrations';

interface DisconnectButtonProps {
    integrationId: number;
}

export default function DisconnectButton({ integrationId }: DisconnectButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect? \n\n⚠️ WARNING: This will remove all synced products from the store.")) {
            return;
        }

        setLoading(true);
        try {
            await disconnectShopify(integrationId);
        } catch (error) {
            console.error("Failed to disconnect:", error);
            alert("Failed to disconnect. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDisconnect}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
            {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
    );
}
