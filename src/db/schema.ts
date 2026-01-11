import { pgTable, text, serial, timestamp, jsonb, integer, boolean, doublePrecision, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    brand: text('brand').notNull(),
    role: text('role').default('vendor').notNull(), // 'admin' or 'vendor'
    vatNumber: text('vat_number'),
    legalBusinessName: text('legal_business_name'),
    brandName: text('brand_name'),
    registrationNumber: text('registration_number'),
    saleorPageSlug: text('saleor_page_slug'),
    payloadBrandPageId: text('payload_brand_page_id'),
    eoriNumber: text('eori_number'),
    phoneNumber: text('phone_number'),
    websiteUrl: text('website_url'),
    street: text('street'),
    city: text('city'),
    postalCode: text('postal_code'),
    countryCode: text('country_code'),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    geocodedAt: timestamp('geocoded_at'),
    shippingCountries: jsonb('shipping_countries').default([]), // Array of country codes e.g. ['NL', 'BE', 'DE']
    twoFactorSecret: text('two_factor_secret'),
    twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
    resetToken: text('reset_token'),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    // Bank Details for Payouts
    iban: text('iban'),
    bic: text('bic'),
    bankAccountHolder: text('bank_account_holder'),
    stripeConnectAccountId: text('stripe_connect_account_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const saleorAuth = pgTable('saleor_auth', {
    saleorApiUrl: text('saleor_api_url').primaryKey().notNull(),
    token: text('token').notNull(),
    appId: text('app_id').notNull(),
    jwks: text('jwks'),
});

export const vendorApplications = pgTable('vendor_applications', {
    id: serial('id').primaryKey(),
    companyName: text('company_name').notNull(),
    email: text('email').notNull(),
    vatNumber: text('vat_number').notNull(),
    legalBusinessName: text('legal_business_name'),
    brandName: text('brand_name'),
    registrationNumber: text('registration_number'),
    eoriNumber: text('eori_number'),
    phoneNumber: text('phone_number'),
    websiteUrl: text('website_url'),
    street: text('street'),
    city: text('city'),
    postalCode: text('postal_code'),
    countryCode: text('country_code'),
    status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected'
    createdAt: timestamp('created_at').defaultNow(),
    processedAt: timestamp('processed_at'),
});

export const integrations = pgTable('integrations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    provider: text('provider').notNull(), // 'shopify', 'woocommerce'
    storeUrl: text('store_url').notNull(),
    accessToken: text('access_token').notNull(),
    status: text('status').default('active').notNull(),
    settings: jsonb('settings'), // { sync_inventory: boolean, shipping_provider: string }
    createdAt: timestamp('created_at').defaultNow(),
});

export const featureRequests = pgTable('feature_requests', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
    status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected', 'implemented'
    createdAt: timestamp('created_at').defaultNow(),
});

export const productOverrides = pgTable('product_overrides', {
    id: serial('id').primaryKey(),
    productId: text('product_id').notNull().unique(), // Saleor Product ID
    shippingCountries: jsonb('shipping_countries').notNull(), // Array of country codes
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const shippingMatrices = pgTable('shipping_matrices', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    zone1Small: integer('zone1_small').default(0),
    zone1Standard: integer('zone1_standard').default(0),
    zone1Heavy: integer('zone1_heavy').default(0),
    zone2Small: integer('zone2_small').default(0),
    zone2Standard: integer('zone2_standard').default(0),
    zone2Heavy: integer('zone2_heavy').default(0),
    zone3Small: integer('zone3_small').default(0),
    zone3Standard: integer('zone3_standard').default(0),
    zone3Heavy: integer('zone3_heavy').default(0),
    zone4Small: integer('zone4_small').default(0),
    zone4Standard: integer('zone4_standard').default(0),
    zone4Heavy: integer('zone4_heavy').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const vendorCountryZones = pgTable('vendor_country_zones', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    zoneNumber: integer('zone_number').notNull(), // 1, 2, 3, 4
    isCustom: boolean('is_custom').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const vendorCountryRates = pgTable('vendor_country_rates', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    tier: varchar('tier', { length: 20 }).notNull(), // small, standard, heavy
    price: integer('price').notNull(), // in cents
    createdAt: timestamp('created_at').defaultNow(),
});