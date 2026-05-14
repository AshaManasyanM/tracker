/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Ubuntu",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["Oswald", "system-ui", "sans-serif"],
        board: ["Rajdhani", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: {
          DEFAULT: "#070a0f",
          raised: "#0d1219",
          overlay: "#121a24",
        },
        line: "#1c2735",
        accent: {
          DEFAULT: "#00d6b4",
          dim: "#00a88d",
          glow: "#33e0c4",
        },
        warn: "#ffb020",
        danger: "#ff5c5c",
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(0, 214, 180, 0.08), 0 12px 40px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
