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
            className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
        >
            {loading ? 'Disconnecting...' : 'Disconnect'}
        </button>
    );
}
