import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Migrate users table - copy warehouseAddress jsonb to individual columns
    const result1 = await db.execute(sql`
      UPDATE users SET
        street = COALESCE(street, (warehouse_address->>'street')::text),
        city = COALESCE(city, (warehouse_address->>'city')::text),
        postal_code = COALESCE(postal_code, (warehouse_address->>'zip')::text),
        country_code = COALESCE(country_code, (warehouse_address->>'country')::text)
      WHERE warehouse_address IS NOT NULL
        AND (street IS NULL OR city IS NULL OR postal_code IS NULL OR country_code IS NULL)
    `);

    // Migrate vendor_applications table
    const result2 = await db.execute(sql`
      UPDATE vendor_applications SET
        street = COALESCE(street, (warehouse_address->>'street')::text),
        city = COALESCE(city, (warehouse_address->>'city')::text),
        postal_code = COALESCE(postal_code, (warehouse_address->>'zip')::text),
        country_code = COALESCE(country_code, (warehouse_address->>'country')::text)
      WHERE warehouse_address IS NOT NULL
        AND (street IS NULL OR city IS NULL OR postal_code IS NULL OR country_code IS NULL)
    `);

    return Response.json({ 
      success: true, 
      message: 'Data migration complete',
      usersUpdated: result1.rowCount,
      applicationsUpdated: result2.rowCount
    });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response('Migration failed: ' + (error as Error).message, { status: 500 });
  }
}
