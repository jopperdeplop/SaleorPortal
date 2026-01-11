import { pgTable, text, serial, timestamp, jsonb, integer, boolean, doublePrecision } from 'drizzle-orm/pg-core';

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
    userId: integer('user_id').references(() => users.id).notNull(),
    // Zone 1: Domestic (e.g., NL to NL)
    zone1Small: doublePrecision('zone1_small').default(4.95),
    zone1Standard: doublePrecision('zone1_standard').default(6.95),
    zone1Heavy: doublePrecision('zone1_heavy').default(12.95),
    // Zone 2: Near EU (e.g., NL to BE/DE)
    zone2Small: doublePrecision('zone2_small').default(8.95),
    zone2Standard: doublePrecision('zone2_standard').default(12.95),
    zone2Heavy: doublePrecision('zone2_heavy').default(24.95),
    // Zone 3: Far EU (e.g., NL to IT/ES)
    zone3Small: doublePrecision('zone3_small').default(12.95),
    zone3Standard: doublePrecision('zone3_standard').default(18.95),
    zone3Heavy: doublePrecision('zone3_heavy').default(34.95),
    // Zone 4: Remote EU (e.g., NL to CY/MT)
    zone4Small: doublePrecision('zone4_small').default(19.95),
    zone4Standard: doublePrecision('zone4_standard').default(29.95),
    zone4Heavy: doublePrecision('zone4_heavy').default(49.95),
    updatedAt: timestamp('updated_at').defaultNow(),
});