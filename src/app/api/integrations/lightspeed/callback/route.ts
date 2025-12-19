
import { db } from '@/db';
import { integrations } from '@/db/schema';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/encryption';
import { auth } from '@/auth';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // We passed domainPrefix here

    if (!code || !state) {
        return new Response('Missing code or state parameter', { status: 400 });
    }

    const domainPrefix = state;

    const clientId = process.env.LIGHTSPEED_CLIENT_ID;
    const clientSecret = process.env.LIGHTSPEED_CLIENT_SECRET;
    const host = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = `${host}/api/integrations/lightspeed/callback`;

    // Exchange code for access token
    // Endpoint: POST https://{domain_prefix}.retail.lightspeed.app/api/1.0/token
    let success = false;
    try {
        if (!clientId || !clientSecret) {
            throw new Error(`Lightspeed Environment Variables Missing: ID=${!!clientId}, Secret=${!!clientSecret}`);
        }

        const tokenResponse = await fetch(`https://${domainPrefix}.retail.lightspeed.app/api/1.0/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: clientId!,
                client_secret: clientSecret!,
                code,
                redirect_uri: callbackUrl,
            }).toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error('❌ [Lightspeed Callback] Token Exchange Failed:', tokenData);
            return new Response(`Failed to get access token: ${tokenData.error || 'Unknown error'}`, { status: 500 });
        }

        const session = await auth();
        if (!session || !session.user?.id) {
            console.error('❌ [Lightspeed Callback] No active session found.');
            return new Response('Unauthorized - Please log in to the portal first', { status: 401 });
        }
        const userId = parseInt(session.user.id);

        // --- SECURITY: Generate Webhook Secret ---
        const webhookSecret = crypto.randomBytes(32).toString('hex');
        const encryptedSecret = encrypt(webhookSecret);

        console.info(`✅ [Lightspeed Callback] Token received for user ${userId}. Saving to DB...`);

        // Save to DB
        await db.insert(integrations).values({
            userId,
            provider: 'lightspeed',
            storeUrl: domainPrefix,
            accessToken: tokenData.access_token,
            status: 'active',
            settings: {
                refreshToken: tokenData.refresh_token,
                expiresAt: Date.now() + (tokenData.expires_in * 1000),
                webhookSecret: encryptedSecret,
                sync_inventory: true
            }
        });

        success = true;
    } catch (error: any) {
        console.error('❌ [Lightspeed Callback] Fatal Error:', error);
        return new Response(`Internal Server Error: ${error.message || 'Unknown'}`, { status: 500 });
    }

    if (success) {
        redirect('/dashboard/integrations?success=true');
    }
}
