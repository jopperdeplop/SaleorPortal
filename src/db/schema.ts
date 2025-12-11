import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(), // This will store the HASHED password
    brand: text('brand').notNull(),       // e.g., 'Nike', 'Adidas'
    createdAt: timestamp('created_at').defaultNow(),
});