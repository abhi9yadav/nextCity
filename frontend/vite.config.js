import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  // ...
  theme: {
    extend: {
      keyframes: {
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        // target: "http://localhost:5000",
        target: `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
      },
    },
  },
  // ...
});
