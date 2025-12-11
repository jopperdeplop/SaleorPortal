export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    brand: string;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    image?: string;
}

export interface Order {
    id: string;
    displayId?: string;
    date: string;
    customer: string;
    total: number;
    currency: string;
    status: 'UNFULFILLED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELED' | 'RETURNED' | string;
}

export interface Brand {
    name: string;
    slug: string;
}

export interface Metrics {
    totalRevenue: number;
    productsListed: number;
    averageOrderValue: number;
    currency: string;
}
