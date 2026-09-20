import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

function emailDevServerPlugin() {
  return {
    name: "email-dev-server-plugin",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === "/api/send-email" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const payload = JSON.parse(body);
              const apiKey = process.env.RESEND_API_KEY || "";
              const fromEmail =
                process.env.FROM_EMAIL || "orders@pehnav.store";

              console.log(
                `[Email Server] Dispatching order email to ${payload.email} for #${payload.order_number}...`
              );

              const resendRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: `PEHNAV <${fromEmail}>`,
                  to: [payload.email],
                  reply_to: "orders@pehnav.store",
                  subject: payload.subject,
                  html: payload.html,
                }),
              });

              const resData = await resendRes.json();
              console.log(
                `[Email Server] Resend response status: ${resendRes.status}`,
                resData
              );

              res.setHeader("Content-Type", "application/json");
              res.statusCode = resendRes.status;
              res.end(JSON.stringify(resData));
            } catch (err: any) {
              console.error("[Email Server Error]:", err);
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || String(err) }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tsConfigPaths(),
    tailwindcss(),
    emailDevServerPlugin(),
  ],
  server: {
    port: 3000,
    host: true,
    // Fix HMR on Windows (uses polling instead of fs events)
    watch: {
      usePolling: process.platform === "win32",
    },
    proxy: {
      "/api/resend": {
        target: "https://api.resend.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, ""),
      },
    },
  },
  // Fix "process is not defined" crashes in browser
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    // Pre-bundle heavy deps to avoid FOUC and cold-start crashes
    include: [
      "react",
      "react-dom",
      "@supabase/supabase-js",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "sonner",
      "lucide-react",
    ],
  },
  build: {
    // Prevent OOM on low-RAM machines
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router", "@tanstack/react-query"],
          ui: ["lucide-react", "sonner"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
