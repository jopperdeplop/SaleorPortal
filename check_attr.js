const API_URL = 'https://api.salp.shop/graphql/';

async function checkAttribute() {
    const query = `
    query {
      attribute(slug: "brand") {
        id
        name
        slug
        inputType
        choices(first: 20) {
          edges {
            node {
              name
              slug
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
            body: JSON.stringify({ query })
        });
        const json = await response.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkAttribute();
