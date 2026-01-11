import { db } from "@/db";
import { users, vendorCountryZones, vendorCountryRates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
) {
    const { searchParams } = new URL(request.url);
    const brandSlug = searchParams.get('brandSlug');
    const secret = request.headers.get('x-app-secret');

    if (!brandSlug || secret !== process.env.TAX_APP_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
        where: eq(users.brand, brandSlug),
    });

    if (!user) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const zones = await db.query.vendorCountryZones.findMany({
        where: eq(vendorCountryZones.userId, user.id),
    });

    const rates = await db.query.vendorCountryRates.findMany({
        where: eq(vendorCountryRates.userId, user.id),
    });

    return NextResponse.json({
        vendorCountry: user.countryCode || 'NL',
        zones: zones.map(z => ({ countryCode: z.countryCode, zoneNumber: z.zoneNumber })),
        overrides: rates.map(r => ({ countryCode: r.countryCode, tier: r.tier, price: r.price }))
    });
}
