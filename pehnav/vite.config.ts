import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      react: {
        babel: {
          plugins: [],
        },
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
  },
});
