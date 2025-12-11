async function getSlug() {
    try {
        // Standard global fetch in Node 18+
        const response = await fetch('https://api.salp.shop/graphql/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query { attribute(id: "QXR0cmlidXRlOjQ0") { slug name } }`
            })
        });
        const data = await response.json();
        console.log(JSON.stringify(data));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

getSlug();
