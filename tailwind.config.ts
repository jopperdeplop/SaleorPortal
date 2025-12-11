import TypographyPlugin from "@tailwindcss/typography";
import FormPlugin from "@tailwindcss/forms";
import ContainerQueriesPlugin from "@tailwindcss/container-queries";
import { type Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // "Euro-Standard" Palette
                terracotta: {
                    DEFAULT: "#cc5500", // Burnt Terracotta (Primary Buttons)
                    dark: "#b34400",    // Hover state
                },
                stone: {
                    50: "#fafaf9",      // App Background
                    100: "#f5f5f4",
                },
                // "Digital Material" Palette
                carbon: "#0F0F0F",      // Primary Text
                vapor: "#F3F4F6",       // Borders/Dividers
                cobalt: "#2F54EB",      // Links/Accents
                signal: "#10B981",      // Success states
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
