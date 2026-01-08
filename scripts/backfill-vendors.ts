import { db } from '../src/db';
import { users } from '../src/db/schema';
import { tasks } from "@trigger.dev/sdk/v3";
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://api.salp.shop/graphql/';

async function discoverSlug(brandName: string) {
    if (!brandName) return null;
    const query = `
        query FindBrandPage($name: String!) {
            pages(filter: { search: $name }, first: 10) {
                edges {
                    node {
                        slug
                        title
                    }
                }
            }
        }
    `;
    
    try {
        const res = await fetch(SALEOR_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { name: brandName } })
        });
        const json = await res.json();
        const pages = json.data?.pages?.edges || [];
        // Find exact title match
        const match = pages.find((e: any) => e.node.title.toLowerCase() === brandName.toLowerCase());
        return match?.node?.slug || (pages[0]?.node?.slug); // Fallback to first search result if no exact match
    } catch (e) {
        console.error(`Failed to discover slug for ${brandName}:`, e);
        return null;
    }
}

async function migrate() {
    console.log("🔍 Fetching vendors for backfill...");
    
    const vendors = await db.select().from(users).where(eq(users.role, 'vendor'));
    
    console.log(`Found ${vendors.length} vendors.`);

    for (const vendor of vendors) {
        console.log(`\n📦 Processing ${vendor.brand} (ID: ${vendor.id})...`);
        
        let updateData: any = {};

        // 1. Backfill structured address from JSONB
        if (!vendor.street && vendor.warehouseAddress) {
            const addr = vendor.warehouseAddress as any;
            updateData.street = addr.street || null;
            updateData.city = addr.city || null;
            updateData.postalCode = addr.zip || null;
            updateData.countryCode = addr.country || null;
        }

        // 2. Backfill brandName/legalBusinessName
        if (!vendor.brandName) updateData.brandName = vendor.brand;
        if (!vendor.legalBusinessName) updateData.legalBusinessName = vendor.brand;

        // 3. Discover Page Slug if missing
        if (!vendor.saleorPageSlug) {
            const slug = await discoverSlug(vendor.brand);
            if (slug) {
                console.log(`   🔗 Found Slug: ${slug}`);
                updateData.saleorPageSlug = slug;
            } else {
                console.log(`   ⚠️  No slug found for brand: ${vendor.brand}`);
            }
        }

        if (Object.keys(updateData).length > 0) {
            await db.update(users).set(updateData).where(eq(users.id, vendor.id));
            console.log(`   ✅ Updated record.`);
        }

        // 4. Trigger Geocoding in Trigger.dev
        if (!vendor.latitude) {
            console.log(`   🚀 Triggering geocoding task...`);
            try {
                await tasks.trigger("geocode-vendor-address", { userId: vendor.id });
                console.log(`   ✅ Task triggered.`);
            } catch (e) {
                console.error(`   ❌ Failed to trigger task:`, e);
            }
        }
    }

    console.log("\n✨ Backfill completed.");
    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
