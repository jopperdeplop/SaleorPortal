'use server';

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://api.salp.shop/graphql/';

export async function toggleProductStatus(productId: string, isEnabled: boolean) {
    const session = await auth();
    const brand = session?.user?.brand;

    if (!session || !brand) {
        throw new Error("Unauthorized");
    }

    const token = process.env.SALEOR_APP_TOKEN;
    if (!token) {
        throw new Error("Server Misconfiguration: SALEOR_APP_TOKEN missing");
    }

    // 1. SECURITY CHECK: Verify Brand Ownership
    // We strictly check if the product has the attribute 'brand' matching the session brand.
    const ownershipQuery = `
        query CheckOwnership($id: ID!) {
            product(id: $id) {
                attributes {
                    attribute { slug }
                    values { name }
                }
            }
        }
    `;

    try {
        const ownershipRes = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Use App Token for reading attributes
            },
            body: JSON.stringify({ query: ownershipQuery, variables: { id: productId } }),
            cache: 'no-store'
        });

        const ownershipJson = await ownershipRes.json();

        if (ownershipJson.errors) {
            console.error("Ownership Check Error:", ownershipJson.errors);
            throw new Error("Failed to verify product ownership");
        }

        const attrs = ownershipJson.data?.product?.attributes || [];
        const brandAttr = attrs.find((a: any) => a.attribute.slug === 'brand');
        const isOwner = brandAttr?.values.some((v: any) => v.name === brand);

        if (!isOwner) {
            console.warn(`Unauthorized Access Attempt: User ${session.user.email} (Brand: ${brand}) tried to modify Product ${productId}`);
            throw new Error("Forbidden: You do not own this product.");
        }

        // 2. GET CHANNEL ID
        // We need the ID for the default channel slug
        const channelSlug = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
        const channelQuery = `
            query ChannelId($slug: String!) {
                channel(slug: $slug) {
                    id
                }
            }
        `;

        const channelRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: channelQuery, variables: { slug: channelSlug } }),
            cache: 'no-store' // Cacheable ideally, but safe to fetch
        });
        const channelJson = await channelRes.json();
        const channelId = channelJson.data?.channel?.id;

        if (!channelId) {
            throw new Error(`Channel not found: ${channelSlug}`);
        }

        // 3. UPDATE PRODUCT STATUS
        const mutation = `
            mutation UpdateProductStatus($id: ID!, $input: ProductInput!) {
                productConnection: productUpdate(id: $id, input: $input) {
                    product {
                        id
                        isAvailable
                    }
                    errors {
                        field
                        message
                    }
                }
            }
        `;

        // We update channel listing specifically
        // Wait, `productUpdate` is for global properties. To update availability per channel, we need `productChannelListingUpdate`.

        const channelListingMutation = `
            mutation UpdateChannelListing($id: ID!, $input: ProductChannelListingUpdateInput!) {
                productChannelListingUpdate(id: $id, input: $input) {
                    errors {
                        field
                        message
                        code
                    }
                }
            }
        `;

        const listingRes = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query: channelListingMutation,
                variables: {
                    id: productId,
                    input: {
                        updateChannels: [{
                            channelId: channelId,
                            isPublished: isEnabled,
                            isAvailableForPurchase: isEnabled
                        }]
                    }
                }
            })
        });

        const listingJson = await listingRes.json();

        if (listingJson.errors) {
            console.error("Mutation GraphQL Error:", listingJson.errors);
            throw new Error("Failed to update product status");
        }

        const domainErrors = listingJson.data?.productChannelListingUpdate?.errors || [];
        if (domainErrors.length > 0) {
            console.error("Mutation Domain Errors:", domainErrors);
            throw new Error(`Update Failed: ${domainErrors[0].message}`);
        }

        revalidatePath('/dashboard/products');
        return { success: true };

    } catch (error: any) {
        console.error("Toggle Product Error:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}
