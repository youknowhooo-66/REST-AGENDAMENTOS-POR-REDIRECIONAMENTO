/** @type {import("tailwindcss").Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core colors
        border: "var(--border)",
        'border-strong': "var(--border-strong)",
        input: "var(--input-border)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "var(--background)",
        'background-elevated': "var(--background-elevated)",
        foreground: "var(--foreground)",

        // Primary
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          light: "rgb(var(--primary-light) / <alpha-value>)",
          dark: "rgb(var(--primary-dark) / <alpha-value>)",
          foreground: "var(--primary-foreground)",
        },

        // Secondary
        secondary: {
          DEFAULT: "var(--secondary)",
          dark: "var(--secondary-dark)",
          foreground: "var(--secondary-foreground)",
        },

        // Accent
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
          foreground: "var(--accent-foreground)",
        },

        // Destructive
        destructive: {
          DEFAULT: "var(--destructive)",
          light: "var(--destructive-light)",
          dark: "var(--destructive-dark)",
          foreground: "var(--destructive-foreground)",
        },

        // Success
        success: {
          DEFAULT: "var(--success)",
          light: "var(--success-light)",
          dark: "var(--success-dark)",
          foreground: "var(--success-foreground)",
        },

        // Warning
        warning: {
          DEFAULT: "var(--warning)",
          light: "var(--warning-light)",
          dark: "var(--warning-dark)",
          foreground: "var(--warning-foreground)",
        },

        // Info
        info: {
          DEFAULT: "var(--info)",
          light: "var(--info-light)",
          dark: "var(--info-dark)",
          foreground: "var(--info-foreground)",
        },

        // Muted
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        // Popover
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },

        // Card
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
          hover: "var(--card-hover)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.4s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
