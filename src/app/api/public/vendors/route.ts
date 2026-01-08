import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * Public endpoint for retrieving vendor locations for the 3D map.
 * This endpoint is secured via an internal secret to prevent unauthorized scraping.
 * It returns a minimal dataset, excluding sensitive tax and business identifiers.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = request.headers.get('x-internal-secret');

    // Security check: Match the shared secret from environment variables
    if (secret !== process.env.INTERNAL_API_SECRET) {
        console.warn("Unauthorized access attempt to public vendor API.");
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log("[API/Vendors] Fetching vendor data...");
        const allUsers = await db.select({ id: users.id, role: users.role, lat: users.latitude, brand: users.brand, brandName: users.brandName }).from(users);
        console.log(`[API/Vendors] Database Stats - Total Users: ${allUsers.length}`);
        console.log(`[API/Vendors] Roles found:`, [...new Set(allUsers.map(u => u.role))]);
        console.log(`[API/Vendors] Users with Lat:`, allUsers.filter(u => u.lat).length);
        console.log(`[API/Vendors] Sample Users:`, JSON.stringify(allUsers.slice(0, 3), null, 2));

        // Query only approved vendors with valid coordinates
        const vendorData = await db.select({
            id: users.id,
            // brandName replaces legacy brand field for public display
            brandName: users.brandName,
            city: users.city,
            countryCode: users.countryCode,
            latitude: users.latitude,
            longitude: users.longitude,
            saleorPageSlug: users.saleorPageSlug
        })
        .from(users)
        .where(
            and(
                eq(users.role, 'vendor'),
                isNotNull(users.latitude),
                isNotNull(users.longitude)
            )
        );

        return NextResponse.json(vendorData, {
            headers: {
                // Optimization: Cache the response for 5 minutes in the edge
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error('Failed to fetch public vendor data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
