/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        muted: "#667085",
        line: "#d8dee7",
        canvas: "#f7f9fb",
        primary: "#0f9f8f",
        primaryDark: "#08766b",
        amberSoft: "#f9b44a",
        blueSoft: "#4d86d9"
      },
      boxShadow: {
        soft: "0 16px 48px rgba(23, 33, 43, 0.08)"
      }
    }
  },
  plugins: []
};
