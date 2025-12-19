
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
        return new Response('Missing shop parameter (domain prefix)', { status: 400 });
    }

    // Lightspeed Retail (X-Series) expects the domain prefix
    const domainPrefix = shop.split('.')[0]; // Handle cases where they might enter the full URL
    const clientId = process.env.LIGHTSPEED_CLIENT_ID;

    const host = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = `${host}/api/integrations/lightspeed/callback`;
    const state = 'nonce'; // In a real app, this should be a secure random value stored in session

    // Lightspeed X-Series OAuth Authorization URL
    // Format: https://{domain_prefix}.retail.lightspeed.app/connect?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&state={state}
    const authUrl = `https://${domainPrefix}.retail.lightspeed.app/connect?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;

    console.log("Redirecting to Lightspeed OAuth:", authUrl);
    redirect(authUrl);
}
