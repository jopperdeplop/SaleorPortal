import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
        return new Response('Missing shop parameter', { status: 400 });
    }

    // Basic cleaning of the shop URL
    let sanitizedShop = shop.trim().replace(/\/$/, ""); // Remove trailing slash
    if (!sanitizedShop.startsWith('http')) {
        sanitizedShop = `https://${sanitizedShop}`;
    }

    const appName = process.env.WOOCOMMERCE_APP_NAME || 'Saleor Partner Portal';
    let host = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://partner.salp.shop';

    // Force HTTPS for WooCommerce callback
    if (host.startsWith('http://')) {
        host = host.replace('http://', 'https://');
    }

    // WooCommerce Auth Parameters
    const scope = 'read_write';
    const userId = session.user.id;
    const returnUrl = `${host}/dashboard/integrations?success=true`;
    const callbackUrl = `${host}/api/integrations/woocommerce/callback`;

    // Construct WooCommerce Auth URL
    // Documentation: https://woocommerce.github.io/woocommerce-rest-api-docs/#introduction
    const installUrl = `${sanitizedShop}/wc-auth/v1/authorize?` +
        `app_name=${encodeURIComponent(appName)}&` +
        `scope=${scope}&` +
        `user_id=${userId}&` +
        `return_url=${encodeURIComponent(returnUrl)}&` +
        `callback_url=${encodeURIComponent(callbackUrl)}`;

    console.log("Redirecting to WooCommerce Auth:", installUrl);

    redirect(installUrl);
}
