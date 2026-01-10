# Brand Page Feature Walkthrough

> [!IMPORTANT] > **Pending Task:** The `migrate-existing-vendors` task in Trigger.dev needs to be run once PayloadCMS is fully stable to populate existing vendors.

This document explains how the vendor brand page customization feature works and how to test it.

---

## Feature Overview

**Goal**: Allow vendors to customize their brand pages through the SaleorPortal, with rich content powered by PayloadCMS.

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         VENDOR APPROVAL                          │
│  Trigger.dev → Creates Saleor Page → Creates PayloadCMS Entry   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         VENDOR EDITING                           │
│  SaleorPortal → /dashboard/brand-page → PayloadCMS API          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        STOREFRONT RENDER                         │
│  /pages/[slug] → Detect Brand Type → Fetch PayloadCMS Content   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Created

### PayloadCMS (payload/saleor-payload)

| File                              | Purpose                                                   |
| --------------------------------- | --------------------------------------------------------- |
| `src/collections/BrandPages.ts`   | Collection for brand page content with vendorId isolation |
| `src/blocks/brand-page-blocks.ts` | BrandHeroBlock, BrandAboutBlock definitions               |
| `src/collections/Media.ts`        | Updated with `ownerId` for media isolation                |

### SaleorPortal

| File                                | Purpose                          |
| ----------------------------------- | -------------------------------- |
| `src/lib/payload.ts`                | PayloadCMS API client            |
| `src/api/brand-page/route.ts`       | API route for brand page CRUD    |
| `src/dashboard/brand-page/page.tsx` | Brand page editor UI             |
| `src/db/schema.ts`                  | Added `payloadBrandPageId` field |

### Trigger.dev (saleor-app-template)

| File                                      | Purpose                                          |
| ----------------------------------------- | ------------------------------------------------ |
| `src/trigger/geocode-vendor.ts`           | Updated to create PayloadCMS entries on approval |
| `src/trigger/migrate-existing-vendors.ts` | One-time migration for existing vendors          |
| `src/trigger/translate-brand-pages.ts`    | Daily translation automation                     |
| `src/db/schema.ts`                        | Added `payloadBrandPageId` field                 |

### Storefront

| File                                                      | Purpose                              |
| --------------------------------------------------------- | ------------------------------------ |
| `src/lib/payload.ts`                                      | PayloadCMS fetch client              |
| `src/ui/components/BrandPageRenderer.tsx`                 | Renders Hero and About blocks        |
| `src/ui/components/BrandProductShowcase.tsx`              | Auto product grid by brand attribute |
| `src/app/[channel]/[locale]/(main)/pages/[slug]/page.tsx` | Updated to detect brand pages        |

---

## Testing Guide

### Step 1: Run PayloadCMS Migration

After the Vercel deployments complete, run the PayloadCMS database migration:

```bash
cd c:\Users\jopbr\Documents\GitHub\payload\saleor-payload
pnpm payload migrate:create
pnpm payload migrate
```

Or trigger a redeploy on Vercel which will auto-migrate.

### Step 2: Migrate Existing Vendors

1. Go to [Trigger.dev Dashboard](https://cloud.trigger.dev)
2. Navigate to **Tasks** → Find `migrate-existing-vendors`
3. Click **Trigger** to run it once
4. Check output - should show "migrated: X, failed: 0"

### Step 3: Test Brand Page Editor

1. Log in to SaleorPortal as a vendor (e.g., test vendor)
2. Navigate to `/dashboard/brand-page`
3. You should see the brand page editor with:
   - **Hero Section**: Tagline, Instagram URL, YouTube URL
   - **About Section**: Heading, Founding Year
4. Fill in some values and click **Save Changes**
5. Verify success message appears

### Step 4: Test Storefront Rendering

1. Visit the storefront: `https://salp.shop/nl/en/pages/[brand-slug]`
   - Replace `[brand-slug]` with the vendor's brand page slug
2. You should see:
   - Hero section with tagline and social links
   - About section with heading
   - Product showcase (if products have `brand` attribute set)

### Step 5: Verify Translation Automation

The translation task runs daily at midnight UTC. To test manually:

1. Go to [Trigger.dev Dashboard](https://cloud.trigger.dev)
2. Navigate to **Tasks** → Find `translate-brand-pages-daily`
3. Click **Trigger** to run manually
4. Check logs for translation activity

---

## Vendor Permissions

| Feature                  | Allowed |
| ------------------------ | :-----: |
| Edit tagline             |   ✅    |
| Edit heading             |   ✅    |
| Add Instagram URL        |   ✅    |
| Add YouTube URL          |   ✅    |
| Add external website     |   ❌    |
| Add custom HTML/JS       |   ❌    |
| Edit other vendor's page |   ❌    |

---

## Security Measures

| Area            | Implementation                                        |
| --------------- | ----------------------------------------------------- |
| Authentication  | JWT session required for /api/brand-page              |
| Authorization   | vendorId extracted server-side, never from client     |
| IDOR Prevention | PayloadCMS access hooks filter by vendorId            |
| Media Isolation | ownerId field on media, filtered by vendor            |
| Social Links    | Only Instagram/YouTube allowed, validated server-side |
| XSS             | Rich text sanitized before render                     |

---

## Troubleshooting

### Brand page not showing in editor

- Check that the vendor has the `payloadBrandPageId` field populated
- Run the `migrate-existing-vendors` task if needed

### Products not showing on brand page

- Ensure products have a `brand` attribute with value matching the brand slug
- Check that products are published in the correct channel

### PayloadCMS errors

- Verify `PAYLOAD_API_URL` and `PAYLOAD_API_KEY` are set in environment variables
- Check PayloadCMS admin panel for API key validity

### Translation not working

- Verify `GOOGLE_AI_API_KEY` is set in Trigger.dev environment variables
- Check the translation task logs for errors

---

## Environment Variables Checklist

| App              | Variable                  | Value                                           |
| ---------------- | ------------------------- | ----------------------------------------------- |
| **SaleorPortal** | `PAYLOAD_API_URL`         | `https://payload-saleor-payload.vercel.app/api` |
| **SaleorPortal** | `PAYLOAD_API_KEY`         | _(from PayloadCMS admin)_                       |
| **Trigger.dev**  | `PAYLOAD_API_URL`         | `https://payload-saleor-payload.vercel.app/api` |
| **Trigger.dev**  | `PAYLOAD_API_KEY`         | _(from PayloadCMS admin)_                       |
| **Storefront**   | `NEXT_PUBLIC_PAYLOAD_URL` | `https://payload-saleor-payload.vercel.app`     |
