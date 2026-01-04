'use server';

import { db } from '@/db';
import { featureRequests } from '@/db/schema';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const requestFeatureSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high']),
});

export async function requestFeature(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const validatedFields = requestFeatureSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
    });

    if (!validatedFields.success) {
        return;
    }

    const { title, description, priority } = validatedFields.data;

    await db.insert(featureRequests).values({
        userId: parseInt(session.user.id),
        title,
        description,
        priority,
        status: 'pending',
    });

    revalidatePath('/dashboard/request-feature');
}

export async function updateFeatureStatus(id: number, status: string, _formData: FormData) {
    const session = await auth();
    if ((session?.user as any)?.role !== 'admin') {
        throw new Error('Unauthorized');
    }

    await db.update(featureRequests)
        .set({ status: status as any })
        .where(eq(featureRequests.id, id));

    revalidatePath('/admin/feature-requests');
    revalidatePath('/dashboard/request-feature');
}
