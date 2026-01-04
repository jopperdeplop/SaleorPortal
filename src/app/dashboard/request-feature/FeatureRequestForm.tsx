'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Flag } from 'lucide-react';

interface FeatureRequestFormProps {
    action: (formData: FormData) => Promise<void>;
}

export function FeatureRequestForm({ action }: FeatureRequestFormProps) {
    const [priority, setPriority] = useState('medium');

    const priorityOptions = [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' }
    ];

    return (
        <form action={action} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Export orders to CSV"
                    className="w-full px-4 py-2.5 rounded-xl border border-vapor dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all placeholder:text-stone-400"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Tell us more about how this feature would help you..."
                    className="w-full px-4 py-2.5 rounded-xl border border-vapor dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta outline-none transition-all resize-none placeholder:text-stone-400"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Priority
                </label>
                <Select
                    value={priority}
                    onChange={setPriority}
                    options={priorityOptions}
                    icon={Flag}
                />
                <input type="hidden" name="priority" value={priority} />
            </div>
            <button
                type="submit"
                className="w-full bg-terracotta text-white py-3 rounded-xl font-bold hover:bg-terracotta/90 transition-all shadow-lg shadow-terracotta/20 active:scale-[0.98]"
            >
                Submit Request
            </button>
        </form>
    );
}
