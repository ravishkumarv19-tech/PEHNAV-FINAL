import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    // Separate chunk for recharts — keeps main bundle lean
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
