# Brand Page Feature Walkthrough

This document explains how the vendor brand page customization feature works and how to test it from scratch.

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

| File                                | Purpose                                             |
| ----------------------------------- | --------------------------------------------------- |
| `src/lib/payload.ts`                | PayloadCMS API client with x-vendor-id support      |
| `src/api/brand-page/route.ts`       | API route for brand page CRUD                       |
| `src/api/media/route.ts`            | Proxy API for secure vendor media uploads           |
| `src/dashboard/brand-page/page.tsx` | Premium editor with image uploads & Social previews |
| `src/components/layout/HeaderLinks` | Integrated "Brand Page" link in vendor dashboard    |

### Trigger.dev (saleor-app-template)

| File                                   | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `src/trigger/geocode-vendor.ts`        | Updated to create PayloadCMS entries on approval |
| `src/trigger/translate-brand-pages.ts` | Daily translation automation                     |
| `src/db/schema.ts`                     | Added `payloadBrandPageId` field                 |

### Storefront

| File                                                      | Purpose                              |
| --------------------------------------------------------- | ------------------------------------ |
| `src/lib/payload.ts`                                      | PayloadCMS fetch client              |
| `src/ui/components/BrandPageRenderer.tsx`                 | Renders Hero (Parallax) and About    |
| `src/ui/components/BrandProductShowcase.tsx`              | Auto product grid by brand attribute |
| `src/app/[channel]/[locale]/(main)/pages/[slug]/page.tsx` | Detects "Brand" type pages & renders |

---

## End-to-End Testing Guide

### Step 1: Create and Approve a New Vendor

1.  Go to the [Vendor Application Page](https://salp.shop/en/register) or create a fresh vendor in the Saleor HUB.
2.  **Approve** the vendor in the Admin Hub.
3.  Monitor [Trigger.dev Dashboard](https://cloud.trigger.dev):
    - The `geocode-vendor` task should run.
    - It should create a **Saleor Page** and a **Payload Brand Page**.
    - Verify the `payloadBrandPageId` is saved in the portal database.

### Step 2: Access the Brand Page Editor

1.  Log in to **SaleorPortal** with the new vendor account.
2.  Click **"Brand Page"** in the top navigation bar.
3.  You should see the premium editor.
4.  **Test Uploads**:
    - Upload a **Brand Logo** (circular preview).
    - Upload a **Cover Image** (landscape preview).
    - Verify images are uploaded to Vercel Blob and linked to the vendor.

### Step 3: Customize and Save

1.  Enter a **Tagline** (e.g., "The future of sustainable fashion").
2.  Add an **Instagram URL** and **YouTube URL**.
3.  Write a **Brand Story** in the About section.
4.  Click **Save Changes**.

### Step 4: Verify Storefront Rendering

1.  Click the **"View Live Page"** link at the top of the editor.
2.  Verify the rendering on `https://salp.shop/[locale]/pages/[slug]`:
    - **Premium Hero**: Parallax cover image + floating logo.
    - **Social Cluster**: Branded Instagram/YouTube buttons.
    - **Story Section**: Clean typography with "Legacy" year badge.
    - **Product Grid**: Ensure products appear (requires products assigned to this brand).

### Step 5: Verify Translation Automation

1.  Wait 24h or trigger `translate-brand-pages-daily` in Trigger.dev manually.
2.  Verify PayloadCMS blocks now have translated values for non-English locales.

---

## Vendor Permissions & Security

| Feature                  | Allowed | Security Implementation                         |
| ------------------------ | :-----: | ----------------------------------------------- |
| Edit Brand Text          |   ✅    | Sanitized server-side                           |
| Upload Images            |   ✅    | Proxy API injects `ownerId` to prevent spoofing |
| Edit Social Links        |   ✅    | Validated against known domains (IG/YT)         |
| Change Brand Slug        |   ❌    | Fixed to Saleor page slug                       |
| Access Other Media       |   ❌    | Payload Access Hooks filter by `vendorId`       |
| View Other Vendor's Page |   ❌    | Multi-tenancy filtering at database level       |

---

## Troubleshooting

### "Brand Page Not Ready"

- The Trigger.dev task might have failed. Check `geocode-vendor` logs.
- Ensure the Saleor Page Type "Brand" exists with ID `UGFnZVR5cGU6NQ==`.

### Images not loading

- Check if `PAYLOAD_PUBLIC_URL` is set correctly in the Storefront.
- Verify that the domain `payload-saleor-payload.vercel.app` is in the `next.config.js` remotePatterns.

### Layout changes not saving

- Check browser console for 401/403 errors (indicates session or permission issue).
- Ensure the `x-vendor-id` header is being passed by the Portal internal fetcher.

---

## Environment Variables Checklist

| App              | Variable                  | Value                                           |
| ---------------- | ------------------------- | ----------------------------------------------- |
| **SaleorPortal** | `PAYLOAD_API_URL`         | `https://payload-saleor-payload.vercel.app/api` |
| **SaleorPortal** | `PAYLOAD_API_KEY`         | _(from PayloadCMS admin)_                       |
| **Trigger.dev**  | `PAYLOAD_API_URL`         | `https://payload-saleor-payload.vercel.app/api` |
| **Trigger.dev**  | `PAYLOAD_API_KEY`         | _(from PayloadCMS admin)_                       |
| **Storefront**   | `NEXT_PUBLIC_PAYLOAD_URL` | `https://payload-saleor-payload.vercel.app`     |
| **Storefront**   | `NEXT_PUBLIC_SERVER_URL`  | `https://salp.shop`                             |
