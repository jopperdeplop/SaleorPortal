const API_URL = 'https://api.salp.shop/graphql/';
const CHANNEL = 'eur';

async function debugProducts() {
    console.log(`Fetching products from ${API_URL} for channel ${CHANNEL}...`);

    const query = `
    query DebugProducts($channel: String!) {
      products(first: 20, channel: $channel) {
        edges {
          node {
            id
            name
            attributes {
              attribute { slug }
              values { name slug }
            }
          }
        }
      }
    }
  `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { channel: CHANNEL } })
        });

        if (!response.ok) {
            console.error("HTTP Error:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response body:", text);
            return;
        }

        const json = await response.json();

        if (json.errors) {
            console.error("GraphQL Errors:", JSON.stringify(json.errors, null, 2));
            return;
        }

        const products = json.data?.products?.edges || [];
        console.log(`Found ${products.length} products total in channel '${CHANNEL}'.`);

        products.forEach(p => {
            const brandAttr = p.node.attributes.find(a => a.attribute.slug === 'brand');
            const brandValues = brandAttr ? brandAttr.values.map(v => `${v.name} (${v.slug})`).join(', ') : 'N/A';
            console.log(`- Product: ${p.node.name} | Brand: ${brandValues}`);
        });

    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

debugProducts();
