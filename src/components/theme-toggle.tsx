"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-32 h-9 rounded-md bg-stone-100 animate-pulse" />;
    }

    return (
        <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-vapor dark:border-stone-700 w-fit">
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "p-2 rounded-md transition-all flex items-center justify-center",
                    theme === "light"
                        ? "bg-white dark:bg-stone-700 text-terracotta shadow-sm"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                )}
                title="Light Mode"
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "p-2 rounded-md transition-all flex items-center justify-center",
                    theme === "system"
                        ? "bg-white dark:bg-stone-700 text-terracotta shadow-sm"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                )}
                title="System Preference"
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-2 rounded-md transition-all flex items-center justify-center",
                    theme === "dark"
                        ? "bg-white dark:bg-stone-700 text-terracotta shadow-sm"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                )}
                title="Dark Mode"
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
}
