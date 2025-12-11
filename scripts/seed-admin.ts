
import { config } from 'dotenv';
// Load environment variables from .env.local
config({ path: '.env.local' });

import { db } from '../src/db/index';
import { users } from '../src/db/schema';
import { hash } from 'bcryptjs';

async function main() {
    const email = 'admin@saleor.io';
    // You can change this password if you like
    const password = 'saleor';
    const brand = 'SaleorDevelopmentStore';

    console.log(`Seeding admin user...`);
    console.log(`Email: ${email}`);
    console.log(`Target Brand: ${brand}`);

    if (!process.env.POSTGRES_URL) {
        console.error('Error: POSTGRES_URL is not defined. Make sure .env.local exists and contains valid credentials.');
        process.exit(1);
    }

    try {
        const hashedPassword = await hash(password, 10);

        // Upsert the user: Insert, or update password/brand if email exists
        await db.insert(users).values({
            name: 'Saleor Admin',
            email,
            password: hashedPassword,
            brand,
        }).onConflictDoUpdate({
            target: users.email,
            set: {
                password: hashedPassword,
                brand: brand
            }
        });

        console.log('✅ Success! Admin user created/updated.');
        console.log(`👉 Login with: ${email} / ${password}`);

    } catch (error) {
        console.error('❌ Error seeding user:', error);
        process.exit(1);
    }
}

main().then(() => process.exit(0));
