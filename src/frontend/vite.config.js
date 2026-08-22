import { execSync } from "child_process";
import { fileURLToPath, URL } from "url";
import { icpBindgen } from "@icp-sdk/bindgen/plugins/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const environment = process.env.ICP_ENVIRONMENT || "local";
const CANISTER_NAMES = ["backend"];

function getCanisterId(name) {
  return execSync(`icp canister status ${name} -e ${environment} --id-only`, {
    encoding: "utf-8",
    stdio: "pipe",
  }).trim();
}

function getDevServerConfig() {
  const networkStatus = JSON.parse(
    execSync(`icp network status -e ${environment} --json`, {
      encoding: "utf-8",
    }),
  );
  const canisterParams = CANISTER_NAMES.map(
    (name) => `PUBLIC_CANISTER_ID:${name}=${getCanisterId(name)}`,
  ).join("&");
  return {
    headers: {
      "Set-Cookie": `ic_env=${encodeURIComponent(
        `${canisterParams}&ic_root_key=${networkStatus.root_key}`,
      )}; SameSite=Lax;`,
    },
    proxy: {
      "/api": { target: networkStatus.api_url, changeOrigin: true },
    },
  };
}

export default defineConfig(({ command }) => ({
  logLevel: "error",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
  },
  css: {
    postcss: "./postcss.config.js",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  plugins: [
    react(),
    icpBindgen({
      didFile: "../backend/backend.did",
      outDir: "./src/bindings",
    }),
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  ...(command === "serve" ? { server: getDevServerConfig() } : {}),
}));
