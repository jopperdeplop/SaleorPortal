
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
        return new Response('Missing shop parameter', { status: 400 });
    }

    // Basic validation of shop URL
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    if (!shopRegex.test(shop)) {
        // Allow user to simple type 'my-store' and append .myshopify.com if they forgot
        if (!shop.includes('.')) {
            // Recursive redirect with fixed URL? Or just fix it here.
            // Let's just fix it if they typed "cool-socks" -> "cool-socks.myshopify.com"
        } else {
            return new Response('Invalid shop URL. Must be something.myshopify.com', { status: 400 });
        }
    }

    const sanitizedShop = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

    const client_id = process.env.SHOPIFY_API_KEY;
    const scopes = 'read_products,write_orders,read_inventory,write_fulfillments';
    const redirect_uri = 'https://partner.salp.shop/api/integrations/shopify/callback';
    // NOTE: For localhost, this MUST be updated in Shopify Partner Dashboard to 'http://localhost:3000/...' 
    // But for the user request, we keep it prod-ready or use env var.
    // Let's use an env var for the host to make it compatible with localhost

    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${host}/api/integrations/shopify/callback`;

    const installUrl = `https://${sanitizedShop}/admin/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${callbackUrl}`; // &state=nonce

    redirect(installUrl);
}
