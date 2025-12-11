import { MOCK_PRODUCTS } from '@/lib/mocks/products';
import { Product, Metrics, Order } from '@/types';

const USE_MOCK = false; // Switched to Real (with Mock Fallback for other data)
const API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL || 'https://api.salp.shop/graphql/';

// Helper
async function executeGraphQL(query: string, variables: any = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store' // Dynamic data
  });
  return res.json();
}

// MOCK DATA GENERATORS (Simplistic - Kept for Metrics/Orders as user likely lacks token)
const getMockMetrics = (brand: string): Metrics => ({
  totalRevenue: 15400,
  productsListed: 12,
  averageOrderValue: 210,
  currency: 'USD'
});

const getMockOrders = (brand: string): Order[] => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `${brand.substring(0, 1).toUpperCase()}${2000 + i}`,
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    customer: `Customer ${i + 1}`,
    total: Math.floor(Math.random() * 200) + 50,
    currency: 'USD',
    status: ['Pending', 'Shipped', 'Delivered'][i % 3] as Order['status']
  }));
};


export async function getProducts(brand: string): Promise<Product[]> {
  // If no API URL, fallback to mock completely
  if (!API_URL || brand === 'Nike' || brand === 'Adidas') {
    // Fallback for demo users
    return MOCK_PRODUCTS.filter(p => p.brand === brand);
  }

  try {
    const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
    // Fetch all products in channel (up to 100 for MVP) and filter client-side 
    // because Brand is a Reference Attribute with inconsistent IDs in this dataset.
    const query = `
          query VendorProducts($channel: String!) {
            products(first: 100, channel: $channel) {
              edges {
                node {
                  id
                  name
                  attributes {
                    attribute { slug }
                    values { name }
                  }
                  defaultVariant {
                     pricing {
                        price {
                            gross {
                                 amount
                                 currency
                            }
                        }
                     }
                  }
                  category { name }
                  isAvailable
                  thumbnail { url }
                }
              }
            }
          }
        `;

    // Note: We don't pass 'brand' variable anymore
    const response = await executeGraphQL(query, { channel });

    if (response.errors) {
      console.error("GraphQL Errors:", response.errors);
      return [];
    }

    const edges = response.data?.products?.edges || [];
    console.log(`Total Products Fetched: ${edges.length} (Filtering for ${brand})`);

    const filteredEdges = edges.filter((edge: any) => {
      const brandAttr = edge.node.attributes.find((a: any) => a.attribute.slug === 'brand');
      if (!brandAttr) return false;
      // Check if any of the values match the brand name
      return brandAttr.values.some((v: any) => v.name === brand);
    });

    console.log(`Filtered Products matching ${brand}: ${filteredEdges.length}`);

    return filteredEdges.map((edge: any) => {
      const node = edge.node;
      const price = node.defaultVariant?.pricing?.price?.gross;

      // Determine stock status based on availability (simplification)
      const stockStatus = node.isAvailable ? 'In Stock' : 'Out of Stock';

      return {
        id: node.id,
        name: node.name,
        category: node.category?.name || 'Uncategorized',
        price: price?.amount || 0,
        currency: price?.currency || 'USD',
        brand: brand,
        stockStatus: stockStatus,
        image: node.thumbnail?.url || undefined
      };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

// Helper to check which languages have translations by creating a dynamic query
async function getFilledLanguages(productId: string, allLanguages: { code: string; language: string }[]) {
  const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
  if (allLanguages.length === 0) return [];

  // Construct dynamic aliases: t_EN: translation(languageCode: EN) { name }
  const aliases = allLanguages.map(l => {
    // We only need to check if 'name' exists to know if translation is filled
    return `t_${l.code.replace('-', '_')}: translation(languageCode: ${l.code}) { name }`;
  }).join('\n');

  const query = `
    query CheckTranslations($id: ID!, $channel: String!) {
      product(id: $id, channel: $channel) {
        id
        ${aliases}
      }
    }
  `;

  try {
    const res = await executeGraphQL(query, { id: productId, channel });
    const p = res.data?.product;
    if (!p) return [];

    // Filter languages where the alias returned a non-null object
    return allLanguages.filter(l => {
      const aliasKey = `t_${l.code.replace('-', '_')}`;
      return p[aliasKey] && p[aliasKey].name;
    });

  } catch (e) {
    console.error("Failed to check translations:", e);
    return [];
  }
}

export async function getVendorProduct(productId: string, languageCode: string = 'EN') {
  const channel = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'default-channel';
  const id = decodeURIComponent(productId);
  const langEnum = languageCode.toUpperCase().replace('-', '_'); // Saleor expects EN_US format usually

  // 1. Fetch Base Product + Shop Languages + Active Translation
  const baseQuery = `
    query ProductBase($id: ID!, $channel: String!, $languageCode: LanguageCodeEnum!) {
      shop {
        languages {
          code
          language
        }
      }
      product(id: $id, channel: $channel) {
        id
        name
        description
        seoDescription
        category { name }
        thumbnail { url }
        media { url alt type }
        
        # Fetch the specific translation for the requested view
        translation(languageCode: $languageCode) {
          name
          description
        }

        attributes {
          attribute { name slug }
          values { name }
        }
        
        variants {
          id
          name
          sku
          pricing {
            price {
              gross {
                amount
                currency
              }
            }
          }
          quantityAvailable
        }
      }
    }
  `;

  try {
    const baseRes = await executeGraphQL(baseQuery, { id, channel, languageCode: langEnum });
    const product = baseRes.data?.product;
    const shopLanguages = baseRes.data?.shop?.languages || [];

    if (!product) return null;

    // 2. Fetch filled languages dynamically
    let availableLanguages = [];

    // Identity Default Language (Optimistic 'EN' fallback)
    const defaultLangCode = shopLanguages.find((l: any) => l.code === 'EN' || l.code === 'EN_US')?.code || 'EN';

    try {
      const filled = await getFilledLanguages(id, shopLanguages);
      availableLanguages = filled.map((l: any) => ({ code: l.code, name: l.language }));
    } catch (err) {
      availableLanguages = shopLanguages.map((l: any) => ({ code: l.code, name: l.language }));
    }

    // ENSURE DEFAULT IS ALWAYS THERE
    if (!availableLanguages.some((l: any) => l.code === defaultLangCode)) {
      const def = shopLanguages.find((l: any) => l.code === defaultLangCode);
      if (def) availableLanguages.unshift({ code: def.code, name: def.language });
    }

    // ENSURE CURRENT IS THERE
    if (!availableLanguages.some((l: any) => l.code === languageCode)) {
      const curr = shopLanguages.find((l: any) => l.code === languageCode);
      if (curr) availableLanguages.push({ code: curr.code, name: curr.language });
      else availableLanguages.push({ code: languageCode, name: languageCode });
    }

    // Deduplicate
    const uniqueLanguages = Array.from(new Map(availableLanguages.map(item => [item.code, item])).values());

    // MERGE TRANSLATION
    // If a translation exists for this language, override name/description
    const name = product.translation?.name || product.name;
    let description = product.translation?.description || product.description;

    return {
      ...product,
      name,
      description,
      availableLanguages: uniqueLanguages
    };

  } catch (error) {
    console.error("Failed to fetch product details:", error);
    return null;
  }
}

export async function getVendorOrder(orderId: string, brand: string) {
  const token = process.env.SALEOR_APP_TOKEN;
  if (!token) return null;

  const query = `
      query VendorOrder($id: ID!) {
        order(id: $id) {
          id
          number
          created
          status
          paymentStatus
          userEmail
          total {
            gross {
              amount
              currency
            }
          }
          shippingAddress {
            firstName
            lastName
            streetAddress1
            city
            postalCode
            country {
              country
            }
          }
          billingAddress {
            firstName
            lastName
            streetAddress1
            city
            postalCode
            country {
              country
            }
          }
          lines {
            productName
            quantity
            variant {
               product {
                  attributes {
                    attribute { slug }
                    values { name }
                  }
               }
               pricing {
                  price {
                     gross {
                        amount
                        currency
                     }
                  }
               }
            }
            totalPrice {
              gross {
                amount
                currency
              }
            }
            thumbnail { url }
          }
          user {
             email
             firstName
             lastName
          }
        }
      }
    `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables: { id: orderId } }),
      cache: 'no-store'
    });

    const json = await res.json();
    const order = json.data?.order;

    if (!order) return null;

    // Security Check: Does this order contain ANY vendor products?
    const vendorLines = order.lines.filter((line: any) => {
      const attrs = line.variant?.product?.attributes || [];
      const brandAttr = attrs.find((a: any) => a.attribute.slug === 'brand');
      return brandAttr?.values.some((v: any) => v.name === brand);
    });

    if (vendorLines.length === 0) {
      return null; // Access Denied: No products for this vendor in this order
    }

    const vendorTotal = vendorLines.reduce((sum: number, line: any) => sum + (line.totalPrice?.gross?.amount || 0), 0);

    return {
      id: order.id,
      displayId: order.number,
      date: order.created.split('T')[0],
      customer: order.userEmail || order.user?.email || 'Guest',
      customerName: order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 'Guest',
      email: order.userEmail || order.user?.email,
      total: vendorTotal,
      currency: order.total.gross.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      lines: vendorLines.map((line: any) => ({
        name: line.productName,
        quantity: line.quantity,
        price: line.totalPrice.gross.amount,
        currency: line.totalPrice.gross.currency,
        image: line.thumbnail?.url
      }))
    };

  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

// Helper to fetch and filter orders for a specific vendor
interface FetchVendorOrdersOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

async function fetchVendorOrders(brand: string, options: FetchVendorOrdersOptions = {}) {
  const { limit = 100, startDate, endDate, status } = options;
  const token = process.env.SALEOR_APP_TOKEN;
  if (!token) return null;

  // Fetch more orders than strictly needed to account for client-side date filtering
  // Ideally Saleor API supports date filtering in query, but for MVP we filter after fetch
  // to keep logic unified with the complex vendor filtering.
  // We effectively fetch the latest 100 (or limit) and THEN filter by date.
  // If the date range is very old, this might miss data if only fetching 100.
  // For this use case (dashboard/recent), capturing the "Last 14 days" usually falls within latest 100 orders globally if volume isn't massive.

  // ADJUSTMENT: Use a slightly higher fetch limit if date filter is active to ensure we catch them
  // LIMIT FIX: API caps at 100. We must respect this. Filtering old orders might be limited in MVP.
  const fetchLimit = (startDate || endDate) ? 100 : limit;

  const query = `
    query VendorOrders($limit: Int!) {
      orders(first: $limit, sortBy: { field: CREATION_DATE, direction: DESC }) {
        edges {
          node {
            id
            number
            created
            status
            total {
              gross {
                amount
                currency
              }
            }
            lines {
              totalPrice {
                gross {
                   amount
                }
              }
              variant {
                product {
                  attributes {
                    attribute { slug }
                    values { name }
                  }
                }
              }
            }
            user {
               email
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables: { limit: fetchLimit } }),
      cache: 'no-store'
    });

    const json = await res.json();
    if (json.errors) {
      console.error("Orders Fetch Error:", json.errors);
      return [];
    }

    const allOrders = json.data?.orders?.edges || [];

    // Filter and Process
    return allOrders.reduce((acc: any[], edge: any) => {
      const order = edge.node;

      // 1. FILTER: Status
      if (status && order.status !== status) {
        return acc;
      }

      // 2. FILTER: Date
      const orderDate = new Date(order.created);
      if (startDate && orderDate < startDate) {
        return acc;
      }
      if (endDate) {
        // Set end date to end of day
        const eod = new Date(endDate);
        eod.setHours(23, 59, 59, 999);
        if (orderDate > eod) {
          return acc;
        }
      }

      // 3. FILTER: Vendor Ownership (Original Logic)
      const lines = order.lines || [];
      let vendorTotal = 0;
      let hasVendorProduct = false;

      lines.forEach((line: any) => {
        const attrs = line.variant?.product?.attributes || [];
        const brandAttr = attrs.find((a: any) => a.attribute.slug === 'brand');
        if (brandAttr?.values.some((v: any) => v.name === brand)) {
          hasVendorProduct = true;
          vendorTotal += line.totalPrice?.gross?.amount || 0;
        }
      });

      if (hasVendorProduct) {
        acc.push({
          ...order,
          vendorTotal: vendorTotal // Attach calculated total
        });
      }
      return acc;
    }, []);

  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export async function getMetrics(brand: string, options?: FilterOptions): Promise<Metrics> {
  const products = await getProducts(brand);
  const orders = await fetchVendorOrders(brand, { limit: 100, ...options });

  if (!orders) {
    return getMockMetrics(brand);
  }

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.vendorTotal, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    totalRevenue,
    productsListed: products.length,
    averageOrderValue: Math.round(avgOrderValue), // Round for display
    currency: 'USD' // Assuming USD for now, strictly should come from order
  };
}

export async function getRecentOrders(brand: string, options?: FilterOptions): Promise<Order[]> {
  const orders = await fetchVendorOrders(brand, { limit: 50, ...options });

  if (!orders) {
    return getMockOrders(brand);
  }

  return orders.map((order: any) => ({
    id: order.id,
    displayId: order.number,
    date: order.created.split('T')[0],
    customer: order.user?.email || 'Guest',
    total: order.vendorTotal, // Use the calculated vendor share
    currency: order.total.gross.currency, // Currency remains from order
    status: order.status
  }));
}
