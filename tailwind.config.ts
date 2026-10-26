import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--bp-border))",
        input: "hsl(var(--bp-input))",
        ring: "hsl(var(--bp-ring))",
        background: "hsl(var(--bp-background))",
        foreground: "hsl(var(--bp-foreground))",
        primary: {
          DEFAULT: "hsl(var(--bp-primary))",
          foreground: "hsl(var(--bp-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--bp-secondary))",
          foreground: "hsl(var(--bp-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--bp-destructive))",
          foreground: "hsl(var(--bp-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--bp-muted))",
          foreground: "hsl(var(--bp-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--bp-accent))",
          foreground: "hsl(var(--bp-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--bp-popover))",
          foreground: "hsl(var(--bp-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--bp-card))",
          foreground: "hsl(var(--bp-card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--bp-sidebar-background))",
          foreground: "hsl(var(--bp-sidebar-foreground))",
          primary: "hsl(var(--bp-sidebar-primary))",
          "primary-foreground": "hsl(var(--bp-sidebar-primary-foreground))",
          accent: "hsl(var(--bp-sidebar-accent))",
          "accent-foreground": "hsl(var(--bp-sidebar-accent-foreground))",
          border: "hsl(var(--bp-sidebar-border))",
          ring: "hsl(var(--bp-sidebar-ring))",
        },
        status: {
          synced: "hsl(var(--bp-status-synced))",
          "synced-foreground": "hsl(var(--bp-status-synced-foreground))",
          local: "hsl(var(--bp-status-local))",
          "local-foreground": "hsl(var(--bp-status-local-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--bp-radius)",
        md: "calc(var(--bp-radius) - 2px)",
        sm: "calc(var(--bp-radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
