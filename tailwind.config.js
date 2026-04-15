import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "inverse-on-surface": "#ecf1ff",
        "tertiary-fixed": "#66ff8e",
        "on-primary-container": "#d4d9ff",
        "on-secondary-fixed": "#410000",
        "secondary-fixed": "#ffdad4",
        "background": "#f9f9ff",
        "surface-variant": "#d8e3fb",
        "outline": "#747688",
        "surface-container": "#e7eeff",
        "on-error": "#ffffff",
        "inverse-primary": "#b9c3ff",
        "on-tertiary-fixed-variant": "#005322",
        "on-tertiary-fixed": "#002109",
        "secondary-fixed-dim": "#ffb4a8",
        "primary-fixed": "#dde1ff",
        "primary-fixed-dim": "#b9c3ff",
        "tertiary-container": "#007030",
        "surface-dim": "#cfdaf2",
        "outline-variant": "#c4c5da",
        "surface-tint": "#0046fa",
        "on-secondary-fixed-variant": "#930000",
        "on-surface": "#111c2d",
        "inverse-surface": "#263143",
        "surface-container-high": "#dee8ff",
        "on-surface-variant": "#434657",
        "on-tertiary": "#ffffff",
        "primary": "#0047FF",
        "on-secondary-container": "#fffbff",
        "surface": "#f9f9ff",
        "primary-container": "#0047ff",
        "on-background": "#111c2d",
        "on-tertiary-container": "#59f986",
        "on-primary": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "secondary": "#bc0000",
        "surface-container-lowest": "#ffffff",
        "error": "#ba1a1a",
        "on-error-container": "#93000a",
        "on-primary-fixed-variant": "#0033c0",
        "tertiary": "#005523",
        "secondary-container": "#e51c10",
        "error-container": "#ffdad6",
        "tertiary-fixed-dim": "#3de273",
        "surface-container-highest": "#d8e3fb",
        "surface-bright": "#f9f9ff",
        "on-secondary": "#ffffff",
        "on-primary-fixed": "#001257",
        "whatsapp": "#2ecc71"
      },
      "borderRadius": {
        "DEFAULT": "0.5rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      "fontFamily": {
        "headline": ["Inter"],
        "body": ["Inter"],
        "label": ["Plus Jakarta Sans"],
        "display": ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        "mono": ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      }
    },
  },
  plugins: [
    containerQueries,
    forms
  ],
}
