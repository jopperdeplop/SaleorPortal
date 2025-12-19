
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
    try {
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
            console.error('Lightspeed Token Error:', tokenData);
            return new Response('Failed to get access token from Lightspeed', { status: 500 });
        }

        const session = await auth();
        if (!session || !session.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }
        const userId = parseInt(session.user.id);

        // --- SECURITY: Generate Webhook Secret ---
        const webhookSecret = crypto.randomBytes(32).toString('hex');
        const encryptedSecret = encrypt(webhookSecret);

        // Save to DB
        // We use the domainPrefix as the storeUrl to uniquely identify the instance
        const [newIntegration] = await db.insert(integrations).values({
            userId,
            provider: 'lightspeed',
            storeUrl: domainPrefix,
            accessToken: tokenData.access_token,
            status: 'active',
            settings: {
                refreshToken: tokenData.refresh_token, // Store refresh token if needed
                expiresAt: Date.now() + (tokenData.expires_in * 1000),
                webhookSecret: encryptedSecret, // Encrypted for security
                sync_inventory: true
            }
        }).returning();

        // NOTE: Lightspeed X-Series webhooks are often managed via the Private App settings 
        // or through the API. We will handle webhook registration in a separate step or via implementation logic.

        redirect('/dashboard/integrations?success=true');
    } catch (error) {
        console.error('Lightspeed Callback Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
