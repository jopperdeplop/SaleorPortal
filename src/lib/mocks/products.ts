import { Product } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
    // NIKE PRODUCTS (5)
    {
        id: 'n1',
        name: 'Nike Air Max 90',
        category: 'Footwear',
        price: 130.00,
        currency: 'USD',
        brand: 'Nike',
        stockStatus: 'In Stock',
        image: '/placeholders/nike-1.jpg'
    },
    {
        id: 'n2',
        name: 'Nike Tech Fleece Hoodie',
        category: 'Apparel',
        price: 110.00,
        currency: 'USD',
        brand: 'Nike',
        stockStatus: 'In Stock',
        image: '/placeholders/nike-2.jpg'
    },
    {
        id: 'n3',
        name: 'Nike Pegasus 40',
        category: 'Footwear',
        price: 140.00,
        currency: 'USD',
        brand: 'Nike',
        stockStatus: 'Low Stock',
        image: '/placeholders/nike-3.jpg'
    },
    {
        id: 'n4',
        name: 'Nike Pro Dri-FIT Leggings',
        category: 'Apparel',
        price: 55.00,
        currency: 'USD',
        brand: 'Nike',
        stockStatus: 'In Stock',
        image: '/placeholders/nike-4.jpg'
    },
    {
        id: 'n5',
        name: 'Nike Heritage Backpack',
        category: 'Accessories',
        price: 45.00,
        currency: 'USD',
        brand: 'Nike',
        stockStatus: 'Out of Stock',
        image: '/placeholders/nike-5.jpg'
    },
    // ADIDAS PRODUCTS (5)
    {
        id: 'a1',
        name: 'Adidas Ultraboost Light',
        category: 'Footwear',
        price: 190.00,
        currency: 'USD',
        brand: 'Adidas',
        stockStatus: 'In Stock',
        image: '/placeholders/adidas-1.jpg'
    },
    {
        id: 'a2',
        name: 'Adidas Adicolor Classics Trefoil Hoodie',
        category: 'Apparel',
        price: 65.00,
        currency: 'USD',
        brand: 'Adidas',
        stockStatus: 'In Stock',
        image: '/placeholders/adidas-2.jpg'
    },
    {
        id: 'a3',
        name: 'Adidas Samba OG',
        category: 'Footwear',
        price: 100.00,
        currency: 'USD',
        brand: 'Adidas',
        stockStatus: 'Low Stock',
        image: '/placeholders/adidas-3.jpg'
    },
    {
        id: 'a4',
        name: 'Adidas Tiro 23 League Pants',
        category: 'Apparel',
        price: 50.00,
        currency: 'USD',
        brand: 'Adidas',
        stockStatus: 'In Stock',
        image: '/placeholders/adidas-4.jpg'
    },
    {
        id: 'a5',
        name: 'Adidas NMD_R1',
        category: 'Footwear',
        price: 150.00,
        currency: 'USD',
        brand: 'Adidas',
        stockStatus: 'In Stock',
        image: '/placeholders/adidas-5.jpg'
    }
];
