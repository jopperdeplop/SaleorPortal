import TypographyPlugin from "@tailwindcss/typography";
import FormPlugin from "@tailwindcss/forms";
import ContainerQueriesPlugin from "@tailwindcss/container-queries";
import { type Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // "Euro-Standard" Palette (Mapped to Variables)
                terracotta: {
                    DEFAULT: "var(--accent)", // Burnt Terracotta
                    dark: "#b34400",    // Keep static for hover or var if needed
                },
                stone: {
                    50: "var(--bg-app)",      // Dynamic App Background
                    100: "var(--border-color)", // Dynamic Border/Surface
                    200: "#e7e5e4",
                    300: "#d6d3d1",
                    400: "#a8a29e",
                    500: "var(--text-secondary)", // Dynamic Secondary Text
                    600: "#57534e",
                    700: "#44403c",
                    800: "#292524",
                    900: "#1c1917",
                    950: "#0c0a09",
                },
                // "Digital Material" Palette (Mapped)
                carbon: "var(--text-primary)",      // Dynamic Primary Text
                vapor: "var(--border-color)",       // Dynamic Borders
                cobalt: "#2F54EB",      // Links/Accents
                signal: "#10B981",      // Success states

                // Semantic Colors
                background: "var(--bg-app)",
                foreground: "var(--text-primary)",
                card: "var(--bg-card)",
                "card-foreground": "var(--text-primary)",
                border: "var(--border-color)",
            },
            fontFamily: {
                serif: ["Times New Roman", "Times", "serif"], // Headings
                sans: ["Inter", "system-ui", "sans-serif"],   // Body/UI
                mono: ["Courier New", "Courier", "monospace"], // ID/Codes
            },
        },
    },
    plugins: [TypographyPlugin, FormPlugin, ContainerQueriesPlugin],
};
export default config;
