import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq, isNotNull, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDb() {
    console.log('Testing database connection...');
    console.log('POSTGRES_URL starts with:', process.env.POSTGRES_URL?.slice(0, 50));

    // Get all users
    const allUsers = await db.select({ 
        id: users.id, 
        role: users.role, 
        brand: users.brand,
        lat: users.latitude 
    }).from(users);

    console.log(`\nTotal users in DB: ${allUsers.length}`);
    console.log('Roles:', [...new Set(allUsers.map(u => u.role))]);
    console.log('Users with coordinates:', allUsers.filter(u => u.lat).length);
    console.log('\nFirst 5 users:');
    allUsers.slice(0, 5).forEach(u => {
        console.log(`  - ID:${u.id} Role:${u.role} Brand:${u.brand} Lat:${u.lat || 'NONE'}`);
    });

    // Get vendors specifically
    const vendorData = await db.select({
        id: users.id,
        brandName: users.brandName,
        latitude: users.latitude,
        longitude: users.longitude,
    }).from(users).where(
        and(
            eq(users.role, 'vendor'),
            isNotNull(users.latitude),
            isNotNull(users.longitude)
        )
    );

    console.log(`\nVendors with coordinates (what the API returns): ${vendorData.length}`);
    vendorData.forEach(v => {
        console.log(`  - ${v.brandName}: ${v.latitude}, ${v.longitude}`);
    });

    process.exit(0);
}

testDb().catch(err => {
    console.error('Database test failed:', err);
    process.exit(1);
});
